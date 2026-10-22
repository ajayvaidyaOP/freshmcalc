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
`ADMIN_*`. See `infrastructure/.env.example`.

## Backups

`infrastructure/scripts/backup.sh` creates a compressed `pg_dump` with 7-day
retention. Schedule it and rehearse a restore:

```bash
0 2 * * * /opt/freshmcalc/infrastructure/scripts/backup.sh >> /var/log/freshmcalc-backup.log 2>&1
```

Store copies off the server (object storage / another region). A backup that
has never been restored is not a backup.

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

Point an uptime monitor (UptimeRobot/BetterStack) at `/health` and alert on
non-200. Watch disk space — the container log driver is capped at 10 MB × 3
files per service.

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

## Mobile releases

See [`mobile-apps.md`](mobile-apps.md). Store builds call the same HTTPS API, so
deploy the backend before submitting binaries.

## Go-live gaps (close before charging real customers)

These are deliberate, documented gaps rather than surprises:

1. **Entitlements are enforced in the UI, not yet per-endpoint.**
   `planEntitlements` drives the locks, but `/api/v1/rates` is public by design
   and `/api/v1/calculations` only requires a login. Before charging, add a
   backend check (e.g. `@PreAuthorize` on save/list) so a free account cannot
   call the API directly. Admins should bypass.
2. **Account deletion** — required by both stores for account-based apps.
   Add `DELETE /api/v1/auth/me` (anonymise or delete, keep invoices) and a
   confirmation UI in Settings.
3. **Webhook reconciliation** — `WebhookController` verifies signatures and
   stores events, but does not yet change subscription state. The verify
   endpoint is the primary activation path; add refund/cancel handling to the
   webhook before refunds matter.
4. **Rate limits are per-IP at Nginx.** Behind a CDN, configure real-client-IP
   headers or the limit will apply to the CDN.
5. **No email delivery** — password reset endpoints are stubs. Wire an SMTP
   provider (the `spring.mail` settings already exist) before launch.
6. **Monitoring** — `/health` + container logs only. Add error tracking
   (Sentry) and a backup-restore rehearsal.
