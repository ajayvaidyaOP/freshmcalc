# FreshmCalc

FreshmCalc is a Dubai fresh produce market-rate and India-to-Dubai export costing platform for fruit and vegetable traders, wholesalers, suppliers and exporters.

## Architecture

- `frontend/` — React + Vite + TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod, Lucide React, Recharts
- `backend/` — Java 21, Spring Boot 3.x, Gradle, Spring Security, Spring Data JPA, Flyway, PostgreSQL, OpenAPI (springdoc), Razorpay, JUnit 5
- `infrastructure/` — Docker, Docker Compose, Nginx, HTTPS, backup scripts
- `docs/` — API, setup, and operational documentation

## Business requirement

Live market rates displayed to subscribers are **Dubai market rates (AED)**, not Indian domestic market rates. India is the sourcing/origin market; Dubai is the destination selling-price market.

## Getting started

See `docs/setup.md` for backend, frontend, Docker, and Razorpay test-mode setup instructions.

## Deployment steps

### Option A: Docker Compose (recommended for production)

From `infrastructure/`:

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your values:
   - `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
   - `JWT_SECRET` (strong, 256+ bits)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
   - `RAZORPAY_TEST_MODE=false` for live payments
   - `CORS_ALLOWED_ORIGINS=https://your-domain.com`
3. Build and start:
   ```bash
   docker compose up --build -d
   ```
4. Verify:
   - Frontend: `http://localhost` (or your domain on port 80/443)
   - Backend API: `http://localhost:8080/api/v1`
   - Health: `http://localhost/health`

### Option B: Manual run

**Backend**
```bash
cd backend
cp .env.example .env   # edit DB_URL, JWT_SECRET, Razorpay keys
./gradlew bootRun      # runs on http://localhost:8080
```

**Frontend**
```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE=http://localhost:8080
npm install
npm run dev            # runs on http://localhost:5173
```

### Nginx + HTTPS

See `infrastructure/nginx/nginx.conf` for the reverse-proxy config. Terminate TLS at Nginx (port 443) and proxy `/api` to the backend on port 8080. Do not expose the backend port directly to the internet.

### Database backups

Run `infrastructure/scripts/backup.sh` on a schedule (cron) to create compressed PostgreSQL dumps with 7-day retention.

### Razorpay test mode

See `docs/razorpay.md`. The backend starts in Razorpay test mode by default. If live credentials or approval are missing, the frontend shows an explicit "configuration required" state. Never expose secret keys in frontend code.

## Acceptance tests

1. Frontend builds and runs (`npm run build`).
2. Backend builds and tests (`./gradlew build`).
3. Migrations run from empty database.
4. Admin publishes a Dubai pomegranate rate.
5. Admin publishes a Dubai green chilli rate.
6. Customers see AED pricing with correct unit and timestamp.
7. Indian domestic rates never misrepresented as Dubai rates.
8. Calculator totals match verified financial test cases.
9. Currency conversion and commission calculations correct.
10. Historical calculations preserve original values.
11. Users cannot access another customer's calculations.
12. Expired subscriptions lose paid-only access.
13. Payment webhooks idempotent (no double activation).
14. PDF quotations contain correct cost breakdown.
15. Admin manages ports, routes, freight quotations.
16. Missing market-data integrations clearly identified, not faked.
