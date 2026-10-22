# Deploy FreshmCalc in 15 minutes

The short, copy-paste version. Deep detail (why Docker, backups, monitoring,
store submission) lives in [`docs/deployment.md`](docs/deployment.md).

```
internet ──► nginx :80/:443 ──┬──► frontend (React SPA)
                              └──► backend (Spring Boot) ──► postgres
```

**You need:** a Linux VPS (2 vCPU / 4 GB, Ubuntu 24.04), a domain, and DNS
access. Roughly ₹400–1,200/month.

---

## 1. Prepare the server

```bash
ssh root@YOUR_SERVER_IP

apt update && apt install -y git curl
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

Open ports **22, 80, 443** in your provider's firewall panel.

## 2. Get the code

```bash
mkdir -p /opt/freshmcalc
git clone https://github.com/ajayvaidyaOP/freshmcalc.git /opt/freshmcalc
cd /opt/freshmcalc
git checkout main
```

## 3. Create the secrets

```bash
cd /opt/freshmcalc/infrastructure
cp .env.example .env

openssl rand -base64 24   # → DB_PASSWORD
openssl rand -base64 48   # → JWT_SECRET

nano .env
```

Fill in at minimum:

| Variable | Value |
|---|---|
| `DB_PASSWORD` | the 24-byte secret you just generated |
| `JWT_SECRET` | the 48-byte secret |
| `CORS_ALLOWED_ORIGINS` | `https://your-domain.com` |
| `APP_PUBLIC_URL` | `https://your-domain.com` |
| `ADMIN_EMAIL` | your email (creates the first admin) |
| `ADMIN_PASSWORD` | a temporary strong password |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | test keys to start |
| `RAZORPAY_WEBHOOK_SECRET` | any long random string; paste the same in Razorpay |

Leave `MAIL_HOST` empty for now — the app runs, password-reset emails just
aren't delivered yet.

## 4. Start

```bash
docker compose up -d --build
docker compose ps            # wait until all four say "healthy" (5–10 min first time)
curl -s http://127.0.0.1/health
```

Visit `http://YOUR_SERVER_IP/`. Log in with the admin account, change the
password, then remove `ADMIN_PASSWORD` from `.env`:

```bash
nano .env                     # delete the ADMIN_PASSWORD line
docker compose up -d backend
```

## 5. Point the domain at the server

At your DNS provider add:

| Type | Name | Value |
|---|---|---|
| A | `@` | your server IP |
| A | `www` | your server IP |

Check with `ping your-domain.com` — it must show the server IP before the next
step.

## 6. HTTPS (one command)

```bash
cd /opt/freshmcalc/infrastructure
./scripts/init-letsencrypt.sh your-domain.com you@your-domain.com
```

If it fails, retry once without hitting Let's Encrypt rate limits:

```bash
STAGING=1 ./scripts/init-letsencrypt.sh your-domain.com you@your-domain.com
```

Then switch the app to HTTPS:

```bash
sed -i 's|^APP_PUBLIC_URL=.*|APP_PUBLIC_URL=https://your-domain.com|' .env
sed -i 's|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://your-domain.com|' .env
docker compose up -d backend
curl -s https://your-domain.com/health
```

Auto-renew (certificates last 90 days):

```bash
crontab -e
15 3 * * * cd /opt/freshmcalc/infrastructure && ./scripts/renew-certs.sh >> /var/log/freshmcalc-tls.log 2>&1
```

## 7. Payments

1. Razorpay Dashboard → **Settings → API keys** → generate **live** keys.
2. Put them in `.env`, set `RAZORPAY_TEST_MODE=false`, `docker compose up -d backend`.
3. Razorpay → **Settings → Webhooks** → add
   `https://your-domain.com/api/v1/webhooks/razorpay`
   with the same secret as `RAZORPAY_WEBHOOK_SECRET`, events:
   `payment.captured`, `payment.failed`, `order.paid`, `refund.created`,
   `refund.processed`.
4. Buy one plan yourself, check `/subscription` shows it active, then refund it
   in the dashboard and confirm the plan is cancelled.

Full contract: [`docs/razorpay.md`](docs/razorpay.md).

## 8. Email (before your first paying customer)

```bash
nano .env
```

```properties
MAIL_HOST=smtp.zoho.in          # or Postmark / SES / Resend
MAIL_PORT=587
MAIL_USERNAME=no-reply@your-domain.com
MAIL_PASSWORD=<app password>
MAIL_FROM=no-reply@your-domain.com
APP_MAIL_EXPOSE_RESET_LINK=false
```

```bash
docker compose up -d backend
```

Test: open `https://your-domain.com/forgot-password`, request a link, and
confirm it arrives and expires after 30 minutes.

## 9. Backups (do this before anyone pays)

```bash
crontab -e
0 2 * * *  cd /opt/freshmcalc/infrastructure && docker compose exec -T postgres /backup/backup.sh >> /var/log/freshmcalc-backup.log 2>&1
0 3 * * 0  cd /opt/freshmcalc/infrastructure && docker compose exec -T postgres /backup/verify-backup.sh >> /var/log/freshmcalc-backup.log 2>&1
```

Dumps land in `infrastructure/backups/` on the host. Sync that folder to object
storage in another region — a backup on the same disk is not a backup.

---

## Everyday release

```bash
cd /opt/freshmcalc/infrastructure
./scripts/deploy.sh
```

Pull → database backup → rebuild → wait for `/health`. If it fails, the script
prints the backend logs.

## Rollback

```bash
cd /opt/freshmcalc
git log --oneline -5          # find the previous good commit
git checkout <commit>
cd infrastructure && docker compose up -d --build
```

Database migrations are forward-only: a rollback of code keeps the migrated
schema (that is fine — new columns are nullable), but never hand-edit
`db/migration`.

## Useful commands

```bash
cd /opt/freshmcalc/infrastructure

docker compose ps                        # status + health
docker compose logs -f backend           # live API logs (X-Request-Id per line)
docker compose logs --since 1h backend   # recent errors
docker compose restart backend           # restart one service
docker compose exec -T postgres psql -U freshmcalc -d freshmcalc   # SQL shell
docker compose down                      # stop (data survives)
docker compose up -d                     # start again
```

## What to check after going live

- [ ] `https://your-domain.com` loads with a valid padlock
- [ ] Sign up → sign in → save a cost sheet → download the PDF
- [ ] A free account sees the upgrade card on **Dubai Live Rates**
- [ ] Password-reset email arrives
- [ ] One real ₹499 payment activates the plan; refund cancels it
- [ ] `https://your-domain.com/manifest.webmanifest` returns JSON (installable app)
- [ ] `https://your-domain.com/privacy`, `/terms`, `/delete-account` are public
- [ ] Uptime monitor on `https://your-domain.com/health`
- [ ] Store builds point at your API: either edit `frontend/.env.native`, or
      `VITE_API_BASE=https://your-domain.com/api/v1 npm run build:app`
