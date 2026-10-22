# FreshmCalc — Setup Guide

FreshmCalc is a Dubai fresh produce market-rate and India-to-Dubai export costing platform.

## Architecture

- `frontend/` — React + Vite + TypeScript, Tailwind CSS, shadcn/ui
- `backend/` — Java 21, Spring Boot 3, Gradle, PostgreSQL, Flyway
- `infrastructure/` — Docker, Docker Compose, Nginx

## Prerequisites

- Java 21 LTS (Temurin recommended)
- Gradle 8.11+
- Node.js 20+ and npm
- PostgreSQL 16 (or Docker Compose)
- Razorpay account (test mode) for subscriptions

## 1. Backend setup

```bash
cd backend
cp .env.example .env   # edit credentials
./gradlew bootJar      # or ./gradlew build
./gradlew bootRun
```

Backend runs on `http://localhost:8080`. API base: `/api/v1`.

### Environment variables (backend `.env`)

```
DB_URL=jdbc:postgresql://localhost:5432/freshmcalc
DB_USERNAME=freshmcalc
DB_PASSWORD=freshmcalc
SERVER_PORT=8080
JWT_SECRET=<change-in-production, at least 256 bits>
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_TEST_MODE=true
CORS_ALLOWED_ORIGINS=http://localhost:5173
ADMIN_EMAIL=admin@freshmcalc.com
ADMIN_PASSWORD=Admin@123
```

Never commit real secrets. `.env` is gitignored.

## 2. Database migrations (Flyway)

Flyway runs automatically on startup against an empty database. Migrations live in `backend/src/main/resources/db/migration`:

- `V1__initial_schema.sql` — normalized schema (users, products, market_rates, ports, routes, calculations, subscriptions, payments, audit logs, etc.)
- `V2__reference_data.sql` — reference countries/cities/ports and default subscription plans

To validate migrations without Hibernate auto-create, `spring.jpa.hibernate.ddl-auto=validate`.

### First admin account

There is **no built-in default admin**. Public registration always creates `CUSTOMER` accounts. To create the first admin, set these environment variables before starting the backend (see `backend/.env.example` / `infrastructure/.env.example`):

```bash
ADMIN_EMAIL=admin@freshmcalc.com
ADMIN_PASSWORD=Admin@123        # local/dev only — use a strong password in production
```

On startup the backend creates this account with role `ADMIN` (or promotes the account if the email is already registered as a customer — its password is not changed). Log in with these credentials at `/login`; the admin panel appears in the sidebar. After first login you may remove `ADMIN_PASSWORD` from the environment.

**Alternatives**

- Promote any registered user directly in the database:
  ```sql
  UPDATE users SET role = 'ADMIN' WHERE email = 'you@company.com';
  ```
- Insert an admin with SQL (password below is `Admin@123`, BCrypt — **change it after login**, dev use only):
  ```sql
  INSERT INTO users (email, password_hash, first_name, role, status, email_verified)
  VALUES ('admin@freshmcalc.com',
          '$2b$10$1q6LuBzWKQSiPwjMxT6I6esFN5xnAiMB7xVL194M2QMotOvbmP/X6',
          'Admin', 'ADMIN', 'ACTIVE', TRUE);
  ```

**Just want to look around?** Use **Explore live demo** on the website (no backend needed) and switch to **Admin view** from the demo banner — no credentials required.

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env   # edit VITE_API_BASE
npm install
npm run dev            # http://localhost:5173
```

Frontend proxies `/api` to `http://localhost:8080` in dev.

## 4. Docker Compose (full stack)

```bash
cd infrastructure
cp .env.example .env   # edit credentials
docker compose up --build
```

Services: postgres (127.0.0.1:5432), backend (127.0.0.1:8080), frontend
(127.0.0.1:5173), nginx (public 80/443). Compose waits for each health check
before starting the next service.

`POSTGRES_INITDB_ARGS`, log rotation (10 MB × 3 per service) and
`stop_grace_period` are already configured — see
`infrastructure/docker-compose.yml`.

## 4b. App builds (PWA + stores)

```bash
cd frontend
npm run build          # web / PWA
npm run build:app      # native build for the store shells
npm test               # costing engine (vitest)
```

Full store submission steps: `docs/mobile-apps.md`.

## 5. Razorpay test-mode setup

See `docs/razorpay.md`. Backend starts in Razorpay test mode by default. If live credentials or approval are missing, the frontend shows an explicit "configuration required" state.

## 6. Windows PowerShell setup

See `scripts/setup.ps1`.

## 7. Business rule (do not change)

Live market rates displayed to subscribers must be **Dubai market rates (AED)**, not Indian domestic market rates. India is the sourcing/origin market; Dubai is the destination selling-price market.

## Acceptance tests

1. Frontend builds and runs (`npm run build`).
2. Backend builds and tests (`./gradlew build`).
3. Migrations run from empty database.
4. Admin publishes a Dubai pomegranate rate.
5. Admin publishes a Dubai green chilli rate.
6. Customers see AED pricing with correct unit and timestamp.
7. Indian domestic rates never misrepresented as Dubai rates.
8. Calculator totals match the worked example in `docs/costing-formula.md`
   (verified by `frontend/src/lib/export-calc.test.ts`).
9. Currency conversion and commission calculations correct.
10. Historical calculations preserve original values.
11. Users cannot access another customer's calculations.
12. Expired subscriptions lose paid-only access.
13. Payment webhooks idempotent (no double activation).
14. PDF quotations contain correct cost breakdown.
15. Admin manages ports, routes, freight quotations.
16. Missing market-data integrations clearly identified, not faked.
17. Installable app: manifest + service worker load, `/get-app` shows both
    install paths, API responses are never cached by the service worker.
18. Native shells build (`npm run build:app` + `npx cap sync`) and the
    calculator draft survives an app restart.
