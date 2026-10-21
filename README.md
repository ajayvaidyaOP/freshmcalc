# FreshmCalc

**Live Dubai fresh-produce market rates (AED) + a complete India → Dubai export costing platform**
for fruit & vegetable traders, wholesalers, suppliers and exporters.

Traders see publisher-verified Dubai wholesale prices, run a full landed-cost calculation
(product, packing, transport, CHA, freight, insurance, duties, commission — INR → AED),
and export professional PDF quotations for buyers.

> **Business rule (do not change):** every selling price shown in the app is a **Dubai, UAE
> market rate in AED**. India is only the sourcing/origin market. Indian domestic prices are
> never presented as Dubai rates.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Project structure](#project-structure)
3. [Part 1 — Run locally in VS Code (step by step)](#part-1--run-locally-in-vs-code-step-by-step)
4. [Environment variables reference](#environment-variables-reference)
5. [Admin account — how to log in as admin](#admin-account--how-to-log-in-as-admin)
6. [Demo mode (no backend needed)](#demo-mode-no-backend-needed)
7. [Useful development commands](#useful-development-commands)
8. [Part 2 — Deploy with Docker (step by step)](#part-2--deploy-with-docker-step-by-step)
9. [Part 3 — Production checklist](#part-3--production-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + TypeScript, Tailwind CSS 3, shadcn/ui (Radix), React Router 6, TanStack Query, React Hook Form + Zod, Recharts, jsPDF |
| Backend | Java 21, Spring Boot 3.3.5 (Web, Security/JWT, Data JPA, Validation, Actuator), Gradle 8.11 (wrapper included) |
| Database | PostgreSQL 16 + Flyway migrations (`backend/src/main/resources/db/migration`) |
| Payments | Razorpay (`razorpay-java`), test mode by default |
| API docs | springdoc OpenAPI — Swagger UI at `/swagger-ui.html` |
| Deployment | Docker + Docker Compose + Nginx (`infrastructure/`) |

**Frontend experience:** green design system (deep-forest palette, Sora + Manrope fonts, light/dark
modes), fully responsive — phone (app-style bottom navigation), tablet (icon rail), desktop
(collapsible sidebar) — plus a marketing landing page and a built-in demo mode.

## Project structure

```
freshmcalc/
├── frontend/            React app (Vite)                 → http://localhost:5173
├── backend/             Spring Boot API (Gradle)         → http://localhost:8080/api/v1
├── infrastructure/      docker-compose.yml, nginx, backup scripts (deployment)
├── docs/                setup.md · razorpay.md · deployment.md
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
| Node.js | **20 LTS or newer** | `node -v` and `npm -v` | https://nodejs.org |
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

For local development the examples work almost as-is. Check these values in **`backend/.env`**:

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
docker compose -f infrastructure/docker-compose.yml up -d postgres
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
Flyway          : Successfully applied 2 migrations
Admin bootstrap : created ADMIN account admin@freshmcalc.com
Tomcat started on port 8080
Started FreshmcalcApplication
```

Verify in the browser:

- Health: <http://localhost:8080/actuator/health> → `{"status":"UP"}`
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- Public rates API: <http://localhost:8080/api/v1/rates> → `[]` (empty until an admin publishes rates)

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
| `RAZORPAY_WEBHOOK_SECRET` | for webhooks | — | Verifies Razorpay webhook signatures |
| `RAZORPAY_TEST_MODE` | no | `true` | Set `false` only with live keys in production |

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

## Useful development commands

| Task | Command |
|---|---|
| Backend — run | `cd backend && ./gradlew bootRun` (Windows: `.\gradlew.bat bootRun`) |
| Backend — build jar | `cd backend && ./gradlew bootJar` → `backend/build/libs/*.jar` |
| Backend — tests | `cd backend && ./gradlew test` *(needs the PostgreSQL container from Step 3 running)* |
| Frontend — dev server | `cd frontend && npm run dev` → http://localhost:5173 |
| Frontend — production build | `cd frontend && npm run build` → `frontend/dist/` |
| Frontend — preview build | `cd frontend && npm run preview` |
| Database only | `docker compose -f infrastructure/docker-compose.yml up -d postgres` |
| Stop database | `docker compose -f infrastructure/docker-compose.yml down` *(add `-v` to also delete data)* |

Flyway note: migrations run automatically on backend startup (`V1` schema + `V2` reference data
including subscription plans ₹499/₹1,299/₹4,999). Never edit an applied migration — add a new `V3__*.sql`.

---

## Part 2 — Deploy with Docker (step by step)

This runs the **whole stack** (PostgreSQL + backend + frontend + Nginx) with one command —
no local JDK/Node/Postgres needed on the server, only Docker.

### Step 1 — Get the code on the server

```bash
git clone https://github.com/ajayvaidyaOP/freshmcalc.git
cd freshmcalc/infrastructure
```

### Step 2 — Configure production secrets

```bash
cp .env.example .env
nano .env        # or open in VS Code / VS Code Remote-SSH
```

Set at minimum:

```properties
DB_PASSWORD=<strong-random-password>
JWT_SECRET=<output of: openssl rand -base64 48>
ADMIN_EMAIL=admin@freshmcalc.com
ADMIN_PASSWORD=<strong-admin-password>
CORS_ALLOWED_ORIGINS=https://your-domain.com
# When Razorpay live keys are ready:
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_TEST_MODE=false
```

### Step 3 — Build and start

```bash
docker compose up --build -d
docker compose ps          # all 4 containers should be Up (postgres: healthy)
docker compose logs -f backend   # watch for "Started FreshmcalcApplication" (Ctrl+C to exit logs)
```

(VS Code equivalent: task **`Full stack: Docker Compose up (build)`**.)

### Step 4 — Verify

| Check | URL / command |
|---|---|
| Website | <http://localhost> (Nginx) or <http://localhost:5173> (frontend container direct) |
| Health | <http://localhost/health> → `{"status":"UP"}` |
| API | <http://localhost:8080/api/v1/rates> |
| Admin login | The `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `infrastructure/.env` |

### Day-2 operations

```bash
docker compose logs -f              # follow all logs
docker compose restart backend      # restart one service
docker compose down                 # stop everything (data volume is kept)
# Update to the latest code:
git pull && docker compose up --build -d
```

Database backups: run `infrastructure/scripts/backup.sh` on a cron schedule
(compressed dumps, 7-day retention). Example: `0 2 * * * /path/to/freshmcalc/infrastructure/scripts/backup.sh`

---

## Part 3 — Production checklist

- [ ] `JWT_SECRET` generated with `openssl rand -base64 48` (not the dev placeholder)
- [ ] `DB_PASSWORD` strong; Postgres port `5432` **not** exposed to the public internet (firewall it, or remove the `ports:` mapping on the `postgres` service)
- [ ] Backend port `8080` firewalled — the public entry point should be Nginx (80/443) only
- [ ] Logged in as admin once → then **remove `ADMIN_PASSWORD`** from the env and restart the backend
- [ ] `CORS_ALLOWED_ORIGINS` set to your real domain
- [ ] **HTTPS**: obtain certificates (e.g. Certbot/Let's Encrypt), mount them into the `nginx`
      service and add a `443 ssl` server block in `infrastructure/nginx/nginx.conf`
      (port 443 is already published). Terminate TLS at Nginx — do not expose Spring Boot directly
- [ ] Razorpay live keys + `RAZORPAY_TEST_MODE=false`; webhook URL set to
      `https://your-domain.com/api/v1/webhooks/razorpay` (see `docs/razorpay.md`)
- [ ] Backup cron scheduled + one restore rehearsal done
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
| `npm install` slow/failing on a fresh clone | Delete `frontend/node_modules`, ensure Node 20+, retry. `node_modules` is never committed |

More detail: [`docs/setup.md`](docs/setup.md) · [`docs/razorpay.md`](docs/razorpay.md) · [`docs/deployment.md`](docs/deployment.md)
