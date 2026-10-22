# Production deployment

## Overview

FreshmCalc runs as four Docker services behind Nginx:

```
internet ──► nginx :80/:443 ──┬──► frontend (static SPA, :80 internal)
                              └──► backend  (Spring Boot, :8080 internal)
                                        └──► postgres (127.0.0.1:5432)
```

Postgres and the raw API/ frontend ports are published on **127.0.0.1 only**.
All public traffic goes through Nginx.

## Why Docker for this product

- Reproducible builds (JDK 21, Node 22, Postgres 16 pinned in images)
- One-command deploys and rollbacks; dependency layers are cached
- Health-checked startup order: Postgres → API → web → edge
- Secrets injected from `.env` at runtime, never baked into images
- Straightforward path to scale: managed Postgres + multiple API containers

A 2 vCPU / 4 GB VPS is enough for the first few hundred traders.

## First deploy

```bash
git clone https://github.com/ajayvaidyaOP/freshmcalc.git
cd freshmcalc/infrastructure
cp .env.example .env
nano .env            # strong DB_PASSWORD, JWT_SECRET, ADMIN_*, Razorpay keys
docker compose up -d --build
docker compose ps    # every service should reach "healthy"
```

Generate secrets:

```bash
openssl rand -base64 24   # DB_PASSWORD
openssl rand -base64 48   # JWT_SECRET
```

Set `CORS_ALLOWED_ORIGINS=https://your-domain.com`.

## HTTPS (required for the installable app and stores)

Service workers, install prompts and the native shells need HTTPS. Terminate
TLS at Nginx:

1. Install Certbot on the host and issue a certificate for your domain.
2. Uncomment the certificate volume mounts in `docker-compose.yml`.
3. Uncomment the `443` server block in `infrastructure/nginx/nginx.conf` and
   the HTTP→HTTPS redirect.
4. `docker compose restart nginx`.

Verify:

```bash
curl -s https://your-domain.com/health          # {"status":"UP"}
curl -sI https://your-domain.com/manifest.webmanifest | grep -i content-type
# application/manifest+json
```

The manifest and `sw.js` are served with `no-cache` so app updates arrive
immediately; hashed assets are cached for a year.

## Environment-based configuration

All credentials come from environment variables. No secrets are committed to
Git. Key values: `DB_*`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `RAZORPAY_*`,
`ADMIN_*`, `APP_PUBLIC_URL`, `MAIL_*`. See `infrastructure/.env.example`.

| Variable | Why it matters |
|---|---|
| `APP_PUBLIC_URL` | Base URL in password-reset emails (`https://freshmcalc.com`). |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` | SMTP for reset links and receipts. Port 587 uses STARTTLS, 465 implicit TLS. Leave empty and the app still runs — resets simply can't be delivered. |
| `APP_MAIL_EXPOSE_RESET_LINK` | `true` only on a dev machine: prints reset links to the log instead of emailing. Never `true` in production. |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies `POST /api/v1/webhooks/razorpay`. Without it the endpoint rejects every event. |

## Backups

Dumps are written to `infrastructure/backups/` **on the host** (bind mount), so
recreating the Postgres container never destroys them.

```bash
# On the host, from infrastructure/
docker compose exec -T postgres /backup/backup.sh

# Prove the newest dump is usable — restores into a scratch database,
# checks the core tables, then drops it:
docker compose exec -T postgres /backup/verify-backup.sh

# Real restore (stops the API first so nothing writes during the restore):
docker compose stop backend
docker compose exec -T postgres /backup/restore.sh /backups/freshmcalc_freshmcalc_20261022_020000.sql.gz
docker compose start backend
```

Schedule both on the host:

```cron
# 02:00 daily backup, 03:00 Sunday rehearsal
0 2 * * *  cd /opt/freshmcalc/infrastructure && docker compose exec -T postgres /backup/backup.sh >> /var/log/freshmcalc-backup.log 2>&1
0 3 * * 0  cd /opt/freshmcalc/infrastructure && docker compose exec -T postgres /backup/verify-backup.sh >> /var/log/freshmcalc-backup.log 2>&1
```

Sync `infrastructure/backups/` to object storage in another region (rclone,
S3, Backblaze). `backup.sh` keeps 7 daily dumps locally — the off-site copy is
what survives a lost server. A backup that has never been restored is not a
backup, which is what the Sunday rehearsal proves.

## Updating

```bash
git pull
docker compose up -d --build
docker compose logs -f backend | grep "Started FreshmcalcApplication"
```

If a Flyway migration is included, it runs automatically on startup. Never edit
an applied migration — add `V3__*.sql`.

## Health & monitoring

| Check | Command |
|---|---|
| Container health | `docker compose ps` |
| API health | `curl -s https://your-domain.com/health` |
| Recent errors | `docker compose logs --since 1h backend` |
| Disk (Postgres volume) | `docker system df -v` |
| Trace one request | `docker compose logs backend | grep <request-id>` |

Every response carries `X-Request-Id` (`RequestIdFilter`), and the same id is
in every backend log line, so a user's screenshot of an error is enough to find
the exact stack trace. Point an uptime monitor (UptimeRobot/BetterStack) at
`/health` and alert on non-200. `/health` is deliberately terse
(`show-details: never`) so it can be public.

For exception tracking with stack traces and alerting, add Sentry — it needs no
code changes:

1. Add `implementation("io.sentry:sentry-spring-boot-starter-jakarta:7.20.0")`
   to `backend/build.gradle`.
2. Set `SENTRY_DSN=https://…` and `SENTRY_ENVIRONMENT=production`.
3. Redeploy. Traces carry the same `X-Request-Id` header in Sentry's request
   context.

Watch disk space — the container log driver is capped at 10 MB × 3 files per
service.

## Security baseline

- Stateless JWT; role-based access (`CUSTOMER` / `ADMIN`)
- Calculation and subscription endpoints take the user from the verified JWT,
  never from a client-supplied `X-User-Id`
- CORS restricted to `CORS_ALLOWED_ORIGINS`
- Login/register rate-limited at the edge (20 req/min per IP, burst 20)
- CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` set by
  the frontend nginx
- Database on loopback; no public 5432
- Backend container runs as a non-root user
- No mock data in production mode
- Payment webhooks are HMAC-verified and de-duplicated (`webhook_events`)
- Password reset uses single-use SHA-256-hashed tokens (30 min TTL), no email
  enumeration
- Behind Cloudflare or an ALB, fill `infrastructure/nginx/realip.conf`
  (`scripts/cloudflare-realip.sh` regenerates it) so rate limits apply to the
  real client IP instead of the proxy's

## Mobile releases

See [`mobile-apps.md`](mobile-apps.md). Store builds call the same HTTPS API, so
deploy the backend before submitting binaries.

## Go-live checklist

Everything that can be closed in code is closed. What remains is operational —
accounts, credentials and hardware you must own.

### Implemented in code (no action needed)

| Requirement | Where |
|---|---|
| Plan entitlements enforced per endpoint (admins bypass) | `AccessControlService`, `MarketRateController`, `CalculationController` |
| Users can always read/delete their own sheets, even after a plan lapses | `CalculationController` |
| Account deletion (store requirement) with anonymisation + plan cancellation | `DELETE /api/v1/auth/me`, Settings → Delete account |
| Public account-deletion page (Play requirement) | `/delete-account` |
| Password reset over email, single-use hashed tokens | `/auth/forgot-password`, `/auth/reset-password`, `MailService` |
| Razorpay webhook reconciliation (capture, failure, refund) | `WebhookController` + `PaymentService.reconcile*` |
| Privacy policy, terms, signup consent | `/privacy`, `/terms`, Register |
| Real client IP behind a CDN | `infrastructure/nginx/realip.conf` |
| Backup + restore rehearsal | `infrastructure/scripts/{backup,restore,verify-backup}.sh` |
| Request correlation id in logs and responses | `RequestIdFilter`, `logback-spring.xml` |

### You must do before the first paying customer

1. **SMTP credentials** — create a mailbox (Zoho/Postmark/SES), set `MAIL_*`,
   send yourself a reset link, confirm it arrives and expires after 30 minutes.
2. **Razorpay KYC + live keys + webhook** — see [`razorpay.md`](razorpay.md).
3. **DNS + HTTPS** — enable the 443 server block, issue certificates, set
   `APP_PUBLIC_URL=https://freshmcalc.com` and `CORS_ALLOWED_ORIGINS`.
4. **Backups off-site** — schedule the cron above and copy dumps to object
   storage.
5. **Uptime monitor** on `/health`, alerting to a phone that is actually
   answered.
6. **Store accounts** — Play Console (US$25 once) and Apple Developer
   (US$99/year); see [`mobile-apps.md`](mobile-apps.md).
7. **Legal review** of `/privacy` and `/terms` by someone qualified for Indian
   DPDP + UAE data handling. The shipped text is a complete, honest draft, not
   legal advice.
