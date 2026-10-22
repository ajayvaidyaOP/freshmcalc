# Production deployment

> Looking for the fast path? [`../DEPLOY.md`](../DEPLOY.md) is the 15-minute
> walkthrough. This page is the reference: reasoning, operations, monitoring and
> the go-live checklist.

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

## Before you start (5 minutes of prep)

| You need | Why | Rough cost |
|---|---|---|
| A Linux VPS, 2 vCPU / 4 GB RAM / 40 GB SSD, Ubuntu 24.04 | runs the four containers | ₹400–1,200 / month |
| A domain you can edit DNS for | HTTPS, store listings, reset links | ₹800–1,200 / year |
| Ports 22, 80, 443 open in the provider firewall | SSH + HTTP + HTTPS | — |
| Docker Engine + Compose plugin | the whole stack | free |

Any provider works (Hostinger, DigitalOcean, Hetzner, Lightsail, Contabo…). Pick a
region close to your users: Mumbai or Dubai for this product.

## First deploy — copy/paste

```bash
# ---------- 1. On the server, as a sudo-capable user ----------
sudo apt update && sudo apt install -y git curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER" && newgrp docker   # or log out/in

# ---------- 2. Get the code ----------
sudo mkdir -p /opt/freshmcalc && sudo chown "$USER" /opt/freshmcalc
git clone https://github.com/ajayvaidyaOP/freshmcalc.git /opt/freshmcalc
cd /opt/freshmcalc

# ---------- 3. Make sure you deploy the branch you want ----------
git checkout main          # after the PR is merged
git pull

# ---------- 4. Configure secrets ----------
cd infrastructure
cp .env.example .env
openssl rand -base64 24     # copy into DB_PASSWORD
openssl rand -base64 48     # copy into JWT_SECRET
nano .env
```

`.env` must have these changed before the first start:

```properties
DB_PASSWORD=<the 24-byte secret>
JWT_SECRET=<the 48-byte secret>
CORS_ALLOWED_ORIGINS=https://your-domain.com
APP_PUBLIC_URL=https://your-domain.com
ADMIN_EMAIL=you@your-domain.com
ADMIN_PASSWORD=<temporary strong password>
RAZORPAY_KEY_ID=rzp_test_...        # test keys first
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=<random string, same as in Razorpay dashboard>
MAIL_HOST=smtp.zoho.in              # optional now, required before launch
MAIL_PORT=587
MAIL_USERNAME=no-reply@your-domain.com
MAIL_PASSWORD=<app password>
MAIL_FROM=no-reply@your-domain.com
```

```bash
# ---------- 5. Start ----------
docker compose up -d --build
docker compose ps                     # wait until every service says "healthy"
curl -s http://127.0.0.1/health       # {"status":"UP",...}
```

Open `http://<server-ip>/` — the site loads over plain HTTP. Log in with the
admin account, change the password, then **remove `ADMIN_PASSWORD` from `.env`**
and `docker compose up -d backend`.

> First build takes 5–10 minutes (Gradle + npm). Later builds reuse layers and
> take ~1 minute.

## HTTPS — one command

DNS first: create `A` records for `your-domain.com` **and** `www.your-domain.com`
pointing at the server IP. Wait until `ping your-domain.com` shows that IP.

```bash
cd /opt/freshmcalc/infrastructure
./scripts/init-letsencrypt.sh your-domain.com you@your-domain.com
```

The script writes `nginx/https.conf` from the example, creates a temporary
self-signed certificate so nginx can start, asks Let's Encrypt for the real one
over HTTP-01, and reloads nginx.

Then point the app at HTTPS:

```bash
sed -i 's|^APP_PUBLIC_URL=.*|APP_PUBLIC_URL=https://your-domain.com|' .env
sed -i 's|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://your-domain.com|' .env
docker compose up -d backend
```

Verify:

```bash
curl -s https://your-domain.com/health          # {"status":"UP"}
curl -sI https://your-domain.com/manifest.webmanifest | grep -i content-type
# application/manifest+json
```

Renewal (certificates last 90 days; this only acts when needed):

```bash
crontab -e
15 3 * * * cd /opt/freshmcalc/infrastructure && ./scripts/renew-certs.sh >> /var/log/freshmcalc-tls.log 2>&1
```

The manifest and `sw.js` are served `no-cache` so app updates arrive
immediately; hashed assets are cached for a year.

## Everyday deploy (after the first time)

```bash
cd /opt/freshmcalc/infrastructure
./scripts/deploy.sh
```

That script pulls the latest commit, takes a database backup, rebuilds, and
waits for `/health` (printing backend logs if it never comes up). Manual
equivalent:

```bash
cd /opt/freshmcalc && git pull
cd infrastructure && docker compose up -d --build
docker compose logs -f backend | grep "Started FreshmcalcApplication"
```

If a deploy goes wrong, the previous images are still on disk:

```bash
cd /opt/freshmcalc && git checkout <previous-commit>
cd infrastructure && docker compose up -d --build
```

Flyway migrations run automatically on startup. **Never edit an applied
migration** — add `V3__*.sql` instead. A migration that fails blocks the
backend from starting, so check `docker compose logs backend` first.

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

`./scripts/deploy.sh` (see above) is the normal path. It backs up first and
health-checks after. Roll back by checking out the previous commit and
rebuilding — see "Everyday deploy".

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
