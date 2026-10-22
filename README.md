# FreshmCalc

**Live Dubai fresh-produce market rates (AED) + a complete India → Dubai export costing platform**
for fruit & vegetable traders, wholesalers, suppliers and exporters.

Traders see publisher-verified Dubai wholesale prices, run a full landed-cost calculation
(product, packing, transport, CHA, freight, insurance, duties, commission — INR → AED),
and export professional PDF quotations for buyers.

The same app installs on a phone (PWA today, Capacitor wrappers for the Play Store and
App Store — see [`docs/mobile-apps.md`](docs/mobile-apps.md)), and runs as a Docker stack
for a subscription business.

> **Business rule (do not change):** every selling price shown in the app is a **Dubai, UAE
> market rate in AED**. India is only the sourcing/origin market. Indian domestic prices are
> never presented as Dubai rates.
>
> **Release status:** read [`docs/production-readiness.md`](docs/production-readiness.md) before deploying or submitting a store build. Frontend checks and direct PostgreSQL migration/backup checks have run, but that runbook explicitly separates them from the Spring/Hibernate, deployment and signed-native-build gates that still need to pass in the release environment.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Project structure](#project-structure)
3. [Part 1 — Run locally in VS Code (step by step)](#part-1--run-locally-in-vs-code-step-by-step)
4. [Environment variables reference](#environment-variables-reference)
5. [Admin account — how to log in as admin](#admin-account--how-to-log-in-as-admin)
6. [Demo mode (no backend needed)](#demo-mode-no-backend-needed)
7. [The export calculator — how the maths works](#the-export-calculator--how-the-maths-works)
8. [Phone app — install now, stores next](#phone-app--install-now-stores-next)
9. [Useful development commands](#useful-development-commands)
10. [Part 2 — Deploy with Docker (and why Docker)](#part-2--deploy-with-docker-and-why-docker)
11. [Part 3 — Production checklist](#part-3--production-checklist)
12. [Troubleshooting](#troubleshooting)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 8 + TypeScript, Tailwind CSS 3, shadcn/ui (Radix), React Router 7, TanStack Query, React Hook Form + Zod, Recharts, jsPDF |
| Mobile | Installable PWA (manifest + service worker) and Capacitor 7 wrappers for Android/iOS |
| Backend | Java 21, Spring Boot 3.3.5 (Web, Security/JWT, Data JPA, Validation, Actuator), Gradle 8.11 (wrapper included) |
| Database | PostgreSQL 16 + Flyway migrations (`backend/src/main/resources/db/migration`) |
| Payments | Fixed-term access via Razorpay orders + server-side signature verification (`razorpay-java`); manual renewal, no auto-debit. Test mode is a development setting, not the production default |
| API docs | springdoc OpenAPI — Swagger UI at `/swagger-ui.html` |
| Tests | Vitest for the costing engine (`frontend/src/lib/export-calc.test.ts`) |
| Deployment | Docker + Docker Compose + Nginx (`infrastructure/`) |

**Frontend experience:** green design system (deep-forest palette, Sora + Manrope fonts, light/dark
modes), fully responsive — phone (app-style bottom navigation), tablet (icon rail), desktop
(collapsible sidebar) — plus a marketing landing page and a built-in demo mode.

## Project structure

```
freshmcalc/
├── frontend/            React app (Vite)                 → http://localhost:5173
│   ├── src/lib/export-calc.ts        the costing engine (+ tests)
│   ├── src/lib/expense-presets.ts    editable CHA/freight/commission defaults
│   ├── public/manifest.webmanifest   installable app metadata
│   ├── public/sw.js                  offline app shell
│   ├── capacitor.config.ts           Play Store / App Store wrapper
│   ├── android/                      generated Android Studio project
│   └── ios/                          generated Xcode project
├── backend/             Spring Boot API (Gradle)         → http://localhost:8080/api/v1
├── infrastructure/      docker-compose.yml, nginx, backup scripts (deployment)
├── docs/                setup.md · razorpay.md · deployment.md · costing-formula.md · mobile-apps.md
└── .vscode/             Run/debug config, tasks, recommended extensions (committed)
```

Ports used: **5173** frontend dev · **8080** backend · **5432** PostgreSQL · **80/443** Nginx (Docker only).

---

## Part 1 — Run locally in VS Code (step by step)

You will run **3 things**: PostgreSQL (via Docker), the backend, and the frontend.

### Step 0 — Install the prerequisites

Install once, then verify each in a terminal:

| Tool | Version | Verify | Get it |
|---|---|---|---|
| Git | any recent | `git --version` | https://git-scm.com |
| VS Code | latest | — | https://code.visualstudio.com |
| JDK | **21** (LTS) | `java -version` | https://adoptium.net (Temurin 21) |
| Node.js | **22.12+** | `node -v` and `npm -v` | https://nodejs.org |
| Docker Desktop | latest | `docker --version` | https://www.docker.com (needed for the database, and for deployment) |

> Gradle does **not** need a separate install — the project ships the Gradle wrapper
> (`backend/gradlew` / `gradlew.bat` + `gradle/wrapper/`), which downloads Gradle 8.11 automatically.

### Step 1 — Clone and open in VS Code

```bash
git clone https://github.com/ajayvaidyaOP/freshmcalc.git
cd freshmcalc
code .
```

VS Code will suggest the recommended extensions (from `.vscode/extensions.json`) — accept them.
The important ones: **Extension Pack for Java**, **Spring Boot Extension Pack**, **Tailwind CSS IntelliSense**, **Docker**.

### Step 2 — Create the environment files (`.env`)

Environment values are **never committed** — copy each example file and edit it:

| Copy this | To | Used by |
|---|---|---|
| `backend/.env.example` | `backend/.env` | backend in VS Code (Step 4) |
| `frontend/.env.example` | `frontend/.env` | frontend dev server (Step 5) |
| `infrastructure/.env.example` | `infrastructure/.env` | Docker deployment (Part 2) only |

```bash
# macOS / Linux / Git Bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp infrastructure/.env.example infrastructure/.env
```

```powershell
# Windows PowerShell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item infrastructure/.env.example infrastructure/.env
```

For local development the backend/frontend examples work almost as-is. The infrastructure example intentionally has no credentials: even a database-only Compose command requires non-empty `DB_PASSWORD` and `JWT_SECRET`. For a disposable local database, set `DB_PASSWORD=freshmcalc` and the development JWT value below in `infrastructure/.env`; generate fresh random values for any deployed server. Check these values in **`backend/.env`**:

```properties
DB_URL=jdbc:postgresql://localhost:5432/freshmcalc
DB_USERNAME=freshmcalc
DB_PASSWORD=freshmcalc
JWT_SECRET=change-me-in-production-this-must-be-at-least-256-bits-long
ADMIN_EMAIL=admin@freshmcalc.com
ADMIN_PASSWORD=Admin@123
```

`frontend/.env` needs one line (already in the example). **Do not change it** — the backend API
lives under `/api/v1`, and Vite proxies `/api` to the backend in dev:

```properties
VITE_API_BASE=/api/v1
```

### Step 3 — Start the database (PostgreSQL via Docker)

In VS Code: **Terminal → Run Task… → `DB: Start PostgreSQL (Docker)`**, or run it manually:

```bash
docker compose --env-file infrastructure/.env -f infrastructure/docker-compose.yml up -d postgres
docker ps          # freshmcalc-postgres should be "healthy" within ~15 seconds
```

<details>
<summary>No Docker? Use a local PostgreSQL install instead</summary>

```sql
CREATE USER freshmcalc WITH PASSWORD 'freshmcalc';
CREATE DATABASE freshmcalc OWNER freshmcalc;
```

The values must match `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` in `backend/.env`.
</details>

### Step 4 — Run the backend (port 8080)

**Easiest (one click):** VS Code → **Run and Debug** (Ctrl/Cmd+Shift+D) →
**`1. FreshmCalc Backend (Spring Boot)`** → ▶ (F5).
The committed launch config (`.vscode/launch.json`) loads `backend/.env` automatically.

**Terminal alternative** — Spring Boot does *not* read `.env` by itself, so load it into the shell first:

```bash
# macOS / Linux / Git Bash
cd backend
set -a && source .env && set +a
./gradlew bootRun
```

```powershell
# Windows PowerShell
cd backend
Get-Content .env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { Set-Item "env:$($matches[1])" $matches[2] } }
.\gradlew.bat bootRun
```

First run downloads Gradle + dependencies (a few minutes). Success looks like:

```
Flyway          : Successfully applied 4 migrations
Admin bootstrap : created ADMIN account admin@freshmcalc.com
Tomcat started on port 8080
Started FreshmcalcApplication
```

Verify in the browser:

- Health: <http://localhost:8080/actuator/health> → `{"status":"UP"}`
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- Rates API: `GET /api/v1/rates` requires a signed-in account with the rates entitlement; an unauthenticated browser request correctly returns 401.

### Step 5 — Run the frontend (port 5173)

Open a **second** VS Code terminal (Terminal → New Terminal, or the task
`Frontend: npm run dev (port 5173)`):

```bash
cd frontend
npm install        # first time only
npm run dev
```

Open **<http://localhost:5173>** — you should see the green FreshmCalc landing page.

### Step 6 — First login + 2-minute smoke test

1. **Log in as admin** with the `backend/.env` values (defaults from the example):
   `admin@freshmcalc.com` / `Admin@123` — the orange/red *Administration* section appears in the sidebar.
2. Go to **Admin → Products & Varieties**: add *Pomegranate* + variety *Wonderful / Grade A* (seed data may already include some).
3. Go to **Admin → Manage Market Rates**: publish a Dubai rate, e.g. AED 42.50 per box.
4. Open **Dubai Live Rates** — your rate is listed with a freshness timer.
5. Open **Export Calculator**, tap the *Pomegranate* preset, **Save cost sheet**, then find it
   under **Saved Cost Sheets** and export the PDF quotation.

If all 5 work, the full stack is healthy. 🎉

> **Login says "Cannot reach the server" / "Login failed"?** The backend (Step 4) is not running —
> the website alone cannot verify credentials. Start the backend (or use [Demo mode](#demo-mode-no-backend-needed)).

---

## Environment variables reference

### Backend (`backend/.env` locally, container env in Docker)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DB_URL` | yes | `jdbc:postgresql://localhost:5432/freshmcalc` | PostgreSQL JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | yes | `freshmcalc` / `freshmcalc` | Database credentials |
| `SERVER_PORT` | no | `8080` | Backend port |
| `JWT_SECRET` | **yes (prod)** | dev placeholder | JWT signing key, 256+ bits. Generate: `openssl rand -base64 48` |
| `JWT_EXPIRATION_MS` | no | `86400000` (24 h) | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | prod | `http://localhost:5173` | Your frontend origin(s), comma-separated |
| `ADMIN_EMAIL` | recommended | — | First admin account, created on startup (see below) |
| `ADMIN_PASSWORD` | recommended | — | First admin password. Remove after first production login |
| `ADMIN_FIRST_NAME` | no | `Admin` | Display name for the bootstrap admin |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | for payments | — | Razorpay API keys (test keys are fine locally). Without them the app still runs; checkout stays disabled |
| `RAZORPAY_WEBHOOK_SECRET` | for webhooks | — | Verifies Razorpay webhook signatures (required for reconcile/refunds) |
| `RAZORPAY_TEST_MODE` | no | `true` locally; `false` in Docker/prod | Use `true` with test keys; keep production `false` |
| `APP_PUBLIC_URL` | for emails | `http://localhost:5173` | Base URL in password-reset links (no trailing slash) |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | for reset emails | — / `587` | SMTP. Empty host = the app runs but reset emails can't be delivered |
| `MAIL_FROM` | no | `no-reply@freshmcalc.com` | From address |
| `APP_MAIL_EXPOSE_RESET_LINK` | dev only | `false` | Print reset links in the log instead of emailing |

### Frontend (`frontend/.env`)

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_BASE` | `/api/v1` | Baked into the bundle **at build time**. In dev, Vite proxies `/api` → `http://localhost:8080`. In Docker it is passed as a build arg (already wired) |

### Infrastructure (`infrastructure/.env`, Docker only)

`DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT` (host port for Postgres, default 5432) —
plus the same `JWT_SECRET`, `RAZORPAY_*`, `CORS_ALLOWED_ORIGINS` and `ADMIN_*` values as the backend
(Docker Compose passes them into the backend container automatically).

---

## Admin account — how to log in as admin

There is **no hard-coded admin**. Public registration always creates `CUSTOMER` accounts.
The first admin is created **automatically on backend startup** when `ADMIN_EMAIL` and
`ADMIN_PASSWORD` are set (defaults above: `admin@freshmcalc.com` / `Admin@123` for local dev):

- Email not registered → an `ACTIVE` **ADMIN** account is created (log: `Admin bootstrap: created ADMIN account …`)
- Email already registered as a customer → it is **promoted** to ADMIN (its password is *not* changed)
- Already an admin → nothing happens

Alternatives:

```sql
-- Promote any registered user in the database
UPDATE users SET role = 'ADMIN' WHERE email = 'you@company.com';

-- Or insert an admin directly (password below is Admin@123 — dev only, change it)
INSERT INTO users (email, password_hash, first_name, role, status, email_verified)
VALUES ('admin@freshmcalc.com',
        '$2b$10$1q6LuBzWKQSiPwjMxT6I6esFN5xnAiMB7xVL194M2QMotOvbmP/X6',
        'Admin', 'ADMIN', 'ACTIVE', TRUE);
```

---

## Demo mode (no backend needed)

To *show* the app without running anything: open the website → **Explore live demo**
(landing hero or login page). The full UI opens with clearly-labelled sample Dubai data;
use the green demo banner inside to switch between **Trader view** and **Admin view**,
and **Exit** to leave. Demo data never touches real accounts. If the backend isn't
running, the login page detects it and offers the demo automatically.

---

## The export calculator — how the maths works

The calculator is now a three-step sheet instead of a wall of fields:

1. **Your shipment** — product, purchase cost in India, boxes, weight per box.
   Quick-start chips load example numbers you can overwrite.
2. **Your Dubai selling price** — AED per box or per kg; the app offers the
   latest published Dubai rate for that product with one tap.
3. **Your export costs** — every head is visible and editable: packing, inland
   transport, port/THC, **CHA & documents**, ocean freight, marine insurance,
   Dubai clearing, mandi commission, bank charges and optional UAE duty.
   Switch any head on/off, change per-box vs per-shipment, or add your own.

Live results appear instantly (and in a sticky bar on phones):

```
total landed cost = purchase + origin + freight + destination + commission & tax
profit            = (Dubai price × boxes) − total landed cost
margin %          = profit ÷ Dubai sale value
ROI %             = profit ÷ landed cost
break-even / box  = landed cost ÷ boxes
```

Costs can be entered in **INR or AED**, as a **fixed amount or a percentage**
(of purchase, freight or sale value). Everything is converted at your FX rate,
rounded half-up like the Java backend, and the full breakdown goes into the
saved sheet and the PDF quotation. Worked example + every formula:
[`docs/costing-formula.md`](docs/costing-formula.md).

> The old screen only sent the purchase cost to the server, so “landed cost”
> was really just the goods. That gap is fixed: the purchase line is now added
> by the server automatically, and each expense head is stored with its group.

---

## Accounts, security and store compliance

| Flow | Where |
|---|---|
| Sign up / sign in | `/register`, `/login` — email normalised to lowercase |
| Forgot password | `/forgot-password` → emailed link (30 min, single use) → `/reset-password` |
| Profile (name, phone, company, city) | Settings → **Save profile** writes to `PATCH /api/v1/auth/me` |
| Plan status | `/subscription`; entitlements come from `GET /api/v1/auth/me` |
| Delete account | Settings → **Delete account** (type `DELETE`) → `DELETE /api/v1/auth/me` |
| Privacy / terms | `/privacy`, `/terms` — linked in the footer and at signup |
| Public deletion page (Play requirement) | `/delete-account` |

Deleting an account anonymises the user (`deleted-<id>@freshmcalc.invalid`), wipes
the profile, cancels the subscription and deletes saved cost sheets. Payment rows
stay, without personal data, for tax/accounting. Paid features are enforced on
the **server** (`AccessControlService`), not just hidden in the UI; admins bypass.
Users can always read or delete their own saved sheets even after a plan lapses.

---

## Phone app — install now, stores next

Open the site on a phone:

- **Android / Chrome** → “Install app” prompt (or ⋮ → *Install app*).
- **iPhone / Safari** → Share → *Add to Home Screen*.
- Inside the app, **Account → Get the app** explains both paths.

What you get immediately: home-screen icon, full-screen layout, offline shell,
faster loads and a calculator draft that survives app switching.

For the actual store listings, the Capacitor wrappers are configured
(`com.freshmcalc.app`, native splash/status bar, back-button handling). The
build and submission steps — signing keys, store assets, review rules and the
iOS/Android payment rules for subscriptions — are in
[`docs/mobile-apps.md`](docs/mobile-apps.md).

---

## Useful development commands

| Task | Command |
|---|---|
| Backend — run | `cd backend && ./gradlew bootRun` (Windows: `.\gradlew.bat bootRun`) |
| Backend — build jar | `cd backend && ./gradlew bootJar` → `backend/build/libs/*.jar` |
| Backend — tests | `cd backend && ./gradlew test` *(needs the PostgreSQL container from Step 3 running)* |
| Frontend — dev server | `cd frontend && npm run dev` → http://localhost:5173 |
| Frontend — production build | `cd frontend && npm run build` → `frontend/dist/` |
| Frontend — preview build | `cd frontend && npm run preview` |
| Frontend — tests | `cd frontend && npm test` (costing engine, 9 cases) |
| Mobile — native build | `cd frontend && npm run build:app` |
| Mobile — Android | `cd frontend && npm run app:android` (needs Android Studio) |
| Mobile — iOS | `cd frontend && npm run app:ios` (needs macOS + Xcode) |
| Database only | `docker compose --env-file infrastructure/.env -f infrastructure/docker-compose.yml up -d postgres` |
| Stop database | `docker compose --env-file infrastructure/.env -f infrastructure/docker-compose.yml down` *(add `-v` to also delete data)* |

Flyway note: migrations run automatically on backend startup (`V1` schema, `V2` reference data,
then the payment-link and rate-history migrations). Never edit an applied migration — add the next sequential migration (currently `V5__*.sql`).

---

## Part 2 — Deploy with Docker (and why Docker)

### Do you actually need Docker?

**Yes — for production, and only Postgres for local development.** This project
is a long-term subscription product, and Docker is what makes that sustainable:

| Without Docker | With Docker |
|---|---|
| Install JDK 21, Node 22 and Postgres 16 on every machine and keep them in sync | One `docker compose up` gives the same stack on your laptop and the server |
| "Works on my machine" bugs before every release | Identical images, identical build output |
| Manual start/stop/restart of three processes | `restart: unless-stopped`, healthchecks, ordered startup |
| Secrets copied into the repo | `.env` injected at runtime, never in an image |
| Upgrade Postgres = risky manual migration | Change the image tag, keep the volume |

You do **not** need Kubernetes, a service mesh or a cloud platform yet. A single
2 vCPU / 4 GB VPS is a starting sizing hypothesis, not a measured capacity or price
guarantee; load-test your own workload. Add managed Postgres and a second API
container only when traffic demands it — the API is stateless (JWT), although
scaling still needs deployment/database/connection-pool testing.

### Steps

**Fast path: [`DEPLOY.md`](DEPLOY.md) (15 minutes, copy-paste).**
Full detail: [`docs/deployment.md`](docs/deployment.md).
Short version:

```bash
# On a fresh Ubuntu VPS
sudo apt update && sudo apt install -y git curl
curl -fsSL https://get.docker.com | sudo sh

sudo mkdir -p /opt/freshmcalc && sudo chown "$USER" /opt/freshmcalc
git clone https://github.com/ajayvaidyaOP/freshmcalc.git /opt/freshmcalc
cd /opt/freshmcalc/infrastructure

cp .env.example .env
openssl rand -base64 24     # DB_PASSWORD
openssl rand -base64 48     # JWT_SECRET
nano .env                   # secrets, domain, admin, Razorpay, SMTP

docker compose config --quiet
docker compose up -d --build
docker compose ps           # all services "healthy"
curl -s http://127.0.0.1/health
```

Then HTTPS in one command (needs DNS pointing at the server):

```bash
./scripts/init-letsencrypt.sh your-domain.com you@your-domain.com
```

After that, every release is:

```bash
cd /opt/freshmcalc/infrastructure && ./scripts/deploy.sh
```

Day-2 tools that ship with the repo: `scripts/deploy.sh` (pull → backup →
rebuild → health-check), `scripts/backup.sh` + `restore.sh` +
`verify-backup.sh` (restore rehearsal), `scripts/renew-certs.sh` (TLS renewal),
`nginx/realip.conf` + `scripts/cloudflare-realip.sh` (real client IPs behind a
CDN).

---

## Part 3 — Production checklist

- [ ] `JWT_SECRET` generated with `openssl rand -base64 48` (not the dev placeholder)
- [ ] `DB_PASSWORD` strong; Postgres port `5432` **not** exposed to the public internet (firewall it, or remove the `ports:` mapping on the `postgres` service)
- [ ] Backend port `8080` firewalled — the public entry point should be Nginx (80/443) only
- [ ] Logged in as admin once → then **remove `ADMIN_PASSWORD`** from the env and restart the backend
- [ ] `CORS_ALLOWED_ORIGINS` set to your real domain
- [ ] **HTTPS**: run `scripts/init-letsencrypt.sh` after DNS is live; it creates the domain-specific
      `infrastructure/nginx/https.conf` and uses the existing Certbot mounts (ports 80/443 are published).
      Terminate TLS at Nginx — do not expose Spring Boot directly
- [ ] Razorpay live keys + `RAZORPAY_TEST_MODE=false`; webhook URL + secret set
      (events: `payment.captured`, `payment.failed`, `order.paid`, `refund.created`,
      `refund.processed`) — see `docs/razorpay.md`
- [ ] `APP_PUBLIC_URL=https://your-domain.com` (password-reset links)
- [ ] SMTP configured (`MAIL_*`) and one reset email received end-to-end
- [ ] Behind Cloudflare/ALB: fill `infrastructure/nginx/realip.conf` so rate limits
      see the real client IP (`scripts/cloudflare-realip.sh` regenerates it)
- [ ] Backup cron scheduled **and** `verify-backup.sh` restore rehearsal passed
      (dumps are on the host at `infrastructure/backups/`; configure and test a separate off-site copy yourself)
- [ ] Uptime monitor on `/health`; every 5xx log line carries the `X-Request-Id`
      returned to the user, so support can find the trace
- [ ] Legal pages reviewed for DPDP/UAE requirements; store consoles point at
      `/privacy`, `/terms`, `/delete-account`
- [ ] Never commit real `.env` files or secret keys (they are git-ignored — keep it that way)

---

## Troubleshooting

| Symptom | Cause & fix |
|---|---|
| **"Login failed" / "Cannot reach the server"** on the website | The backend isn't running (Part 1, Step 4). The frontend alone can't verify logins. Start it, or use **Explore live demo** |
| Logged in but **no Admin section** in sidebar | You're a CUSTOMER. Set `ADMIN_EMAIL` to your email + restart backend (auto-promote), or run the `UPDATE users SET role='ADMIN'…` SQL above |
| Backend: `Connection to localhost:5432 refused` | PostgreSQL isn't up — Part 1, Step 3 (`docker compose … up -d postgres`, then `docker ps` should show *healthy*) |
| Backend: Flyway `validate` / checksum errors after pulling new code | The dev database predates a schema change. For **local dev only**: `docker compose down -v` (deletes dev data) then start again. Never do this in production |
| `Port 8080 / 5173 / 5432 already in use` | Something else is using it. Find & stop it (`lsof -i :8080` on macOS/Linux, `netstat -ano \| findstr :8080` on Windows) or change `SERVER_PORT` / `DB_PORT` |
| `./gradlew: Permission denied` (macOS/Linux) | `chmod +x gradlew` once |
| Gradle/Java errors about version | Ensure `java -version` prints **21**. In VS Code set the Java runtime to the JDK 21 install (the Gradle toolchain then matches automatically) |
| Frontend loads but **no rates / API errors** in browser console | Check `frontend/.env` has `VITE_API_BASE=/api/v1` and restart `npm run dev` (Vite reads env only at startup). Backend must be on 8080 |
| Live rates/calculator show **lock icons** | Those features need an active subscription (admins have full access). Subscribe via **Subscription & Billing** once Razorpay keys are configured |
| Docker: `docker compose up` rebuilds everything every time | Expected with `--build`. For restarts without code changes use `docker compose up -d` |
| **Deploy:** containers start but `/health` never turns healthy | `docker compose logs backend`. Usual causes: wrong `DB_PASSWORD` (Postgres volume was created with another password — reset with `docker compose down -v` **only on a fresh install**), or a failed Flyway migration |
| **Deploy:** `502 Bad Gateway` from nginx | Backend container is restarting. `docker compose ps` + `docker compose logs --tail 100 backend` |
| **Deploy:** site loads on the IP but the domain times out | DNS `A` record missing/wrong, or the provider firewall blocks 80/443 |
| **Deploy:** `init-letsencrypt.sh` fails with "challenge does not match" | DNS not propagated yet, or `www.` record missing — both names are requested. Test first with `STAGING=1 ./scripts/init-letsencrypt.sh …` |
| **Deploy:** certificate issued but browser warns | You tested against staging and kept the staging cert: run `rm -rf infrastructure/certbot/conf/live/your-domain.com` then the script again without `STAGING=1` |
| `npm install` slow/failing on a fresh clone | Delete `frontend/node_modules`, ensure Node 20+, retry. `node_modules` is never committed |

More detail: [`docs/setup.md`](docs/setup.md) · [`docs/razorpay.md`](docs/razorpay.md) · [`docs/deployment.md`](docs/deployment.md)
