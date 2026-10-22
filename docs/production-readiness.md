# Production readiness and release runbook

**Audit date:** 22 October 2026  
**Status:** **not yet certified for production or Play Console submission.** The source has been reviewed and repaired, and clean PostgreSQL migrations plus real backup/restore checks now pass. A backend/Spring build, Hibernate validation, a deployed smoke test and a signed Android build must still pass in the release environment.

This file separates evidence from assumptions. Do not replace the checks below with “it built on my machine”.

## 1. Evidence from the audit environment

| Check | Result |
|---|---|
| `frontend/npm ci --no-audit --no-fund` | Passed from the lockfile |
| `npm run lint` | Passed with 0 errors; 5 React Fast Refresh warnings in shared UI/component modules |
| `npm test` | 9/9 costing-engine tests passed (Vitest 5.0.5) |
| `npm run build` | Passed (Vite 8.3.5) |
| `npm run build:app` | Passed (native-mode web bundle) |
| `npx cap sync android` | Passed; web assets and five Capacitor Android plugins synced (not a native Gradle build) |
| `npm audit --omit=dev` | 0 known production dependency vulnerabilities at audit time |
| Full `npm audit` | 7 development-only findings remain (5 high, 2 moderate), rooted in Tailwind CSS 3's scanning dependencies; no automatic major upgrade was forced |
| Java parser over `backend/src` | 104 Java files parsed, 0 syntax failures. **This is not Java compilation or type checking.** |
| Disposable PostgreSQL 16.14 | V1–V4 applied successfully to an empty database; seed counts, V3 payment-link uniqueness and V4 baseline/duplicate-guard checks passed |
| Entity/schema comparison | All 22 entity tables have matching column names; 191 mapped columns showed 0 nullability/length/precision/scale mismatches. This supplements—not replaces—Hibernate validation |
| Real backup/restore execution | `backup.sh`, scratch-database `verify-backup.sh`, and replacement `restore.sh` passed on PostgreSQL 16; a dump missing required tables was correctly rejected. Docker execution remains untested |
| `bash -n infrastructure/scripts/*.sh` | All deployment/backup scripts passed syntax checking |
| Compose YAML parser | YAML syntax passed; Compose interpolation/container startup was not executed |
| `git diff --check` | No whitespace errors |

### Not verified in the audit environment

- Spring Boot compilation, Java unit tests and the fat JAR.
- Spring context startup, repository derivation and Hibernate's own `ddl-auto=validate` (the SQL migrations and a separate entity/column comparison did run).
- Docker image builds, Compose startup, Nginx/TLS and in-container backup/restore execution.
- Razorpay checkout/webhooks/refunds with real gateway credentials, or SMTP delivery.
- Android SDK compilation, a signed AAB, iOS compilation, or real-device behavior.
- Domain ownership/availability of `freshmcalc.com`, legal review, load testing or store approval.

## 2. Source issues corrected during the review

- Security filter/error handling, authentication entry point, non-default production-secret guard and generic internal-error responses.
- Restored the shared JPA identity mapping (`BaseEntity.id`/`getId()`), removed the duplicate audit timestamp mapping, and aligned five entity column names with Flyway. Added mapping regression tests.
- Server-side paid-feature checks for saved-sheet creation now align with the UI; admin audit identity comes from the JWT principal rather than `X-User-Email`. Client-only calculator/PDF limits are called out separately below.
- Rate creation now explicitly publishes; admins can see/re-publish draft and stale rows; subscriber feeds are Dubai-only; history uses persisted snapshots rather than pretending current rows are a time series.
- Country/city-aware port creation and shipping-route creation were connected end to end.
- Refund reconciliation is linked to the payment that created a subscription (new Flyway migration), instead of cancelling whichever plan happens to be active.
- Billing copy now matches the implementation: **one-time Razorpay orders buy fixed-term access; there is no auto-renewal/auto-debit.** Fallback plans cannot be purchased when the live catalogue is unavailable.
- Docker deployment refuses missing DB/JWT secrets; pre-deploy backup failure stops deployment; backup publication is atomic; restore recreates the database instead of importing into existing tables. Real restore testing also caught and fixed unsafe `psql -c` variable handling.
- Android source targets/compiles API 36 with AGP 8.9.1; the existing Gradle wrapper is 8.11.1.
- The admin user directory now reads real server data instead of showing a permanent placeholder.

These are source changes, not runtime certification. Review the full diff and run the gates below before merging a release.

## 3. Remaining engineering/release work

1. **Compile and test the backend.** Java syntax parsing cannot catch missing methods, wrong generic types, Spring repository-query errors or dependency conflicts.
2. **Run the Spring `MigrationContextTest` and rehearse V1–V4 on a copy of the existing production database.** Clean SQL migrations passed in this audit, but Hibernate/Spring validation and an existing-data upgrade still need to pass. Keep a verified backup before migrating. V3 adds `subscriptions.source_payment_id`; V4 baselines published-rate history.
3. **Exercise staging end to end:** free-vs-paid access, admin draft/publish/stale/re-publish, port/route/quote creation, saved sheets, PDF, deletion, password reset, payment, duplicate webhook and old/new-payment refund cases.
4. **Resolve or consciously accept the Tailwind 3 development audit findings.** Production dependencies are currently clean, but CI/build images should not be ignored. A Tailwind 4 upgrade needs visual regression testing; do not blindly run `npm audit fix --force`.
5. **Review legal text against actual operations.** In particular, confirm hosting regions/sub-processors, support response times, the payment-record retention period and an actual retention/deletion schedule. Repository backups are local by default; off-site copies are a separate operational task.
6. **Add pagination before large datasets.** The admin directory currently performs per-user plan lookups and rate history is capped at 1,000 rows. This is acceptable only after an initial-scale decision, not an unlimited-scale design.
7. **Decide how strong the paid calculator/PDF boundaries must be.** Costing and PDF generation run in the client. UI entitlement checks—and the server check on saving a sheet—do not make offline calculation or export non-bypassable. If those capabilities must be securely metered, move the sensitive calculation/PDF operations to authenticated server endpoints that enforce the relevant plan entitlements.
8. Run accessibility, responsive visual, load and real-device tests. No VPS sizing in the documentation is a benchmark guarantee.

## 4. Required local/CI verification

Use JDK 21 for the backend and Node 22.12+ for the current frontend toolchain.

```bash
cd frontend
npm ci
npm run lint
npm test
npm run build
npm run build:app
npm audit --omit=dev

cd ../backend
./gradlew clean test bootJar
```

Run the PostgreSQL integration test against an empty disposable database (never production):

```bash
cd backend
export FMC_TEST_DB_URL='jdbc:postgresql://127.0.0.1:5432/freshmcalc_test'
export FMC_TEST_DB_USERNAME='freshmcalc'
export FMC_TEST_DB_PASSWORD='your-local-test-password'
./gradlew test --tests '*MigrationContextTest'
```

The migration test is skipped unless `FMC_TEST_DB_URL` is set, so ordinary unit tests do not silently depend on a developer's local database.

## 5. VPS deployment (Docker + Nginx + PostgreSQL)

### Prepare

- Start with a reviewed release commit that has passed the checks above.
- Use a VPS with Docker Engine and the Compose plugin. A 2 vCPU/4 GB instance is only a starting sizing hypothesis; load-test it.
- Point DNS for the chosen domain to the VPS. The provided certificate script requests both `domain.com` and `www.domain.com`, so either configure both or adjust that command.
- Open inbound 80/443 only. Keep PostgreSQL and backend loopback-only as Compose configures them.
- Have SMTP credentials and, when ready, Razorpay live credentials/webhook secret.

### Configure and start

```bash
sudo mkdir -p /opt/freshmcalc
sudo chown "$USER" /opt/freshmcalc
git clone https://github.com/ajayvaidyaOP/freshmcalc.git /opt/freshmcalc
cd /opt/freshmcalc
# Check out the reviewed release tag/commit here before building.
cd infrastructure
cp .env.example .env
chmod 600 .env
openssl rand -base64 24   # put output in DB_PASSWORD
openssl rand -base64 48   # put output in JWT_SECRET
nano .env
```

Set at minimum:

```dotenv
DB_PASSWORD=<random>
JWT_SECRET=<random>
APP_PUBLIC_URL=https://your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
ADMIN_EMAIL=<your-admin-email>
ADMIN_PASSWORD=<strong-one-time-bootstrap-password>
MAIL_HOST=<smtp-host>
MAIL_USERNAME=<smtp-user>
MAIL_PASSWORD=<smtp-secret>
RAZORPAY_TEST_MODE=false
```

Leave Razorpay keys empty until checkout is configured; payments then stay disabled. Do not use the old `Admin@123`, `freshmcalc` or development JWT values—the production guard/Compose validation is intended to reject them.

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1/health
```

All application services must be healthy. Inspect logs instead of exposing ports to debug remotely:

```bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 nginx
```

### HTTPS, email and payments

With DNS already live:

```bash
cd /opt/freshmcalc/infrastructure
./scripts/init-letsencrypt.sh your-domain.com you@your-domain.com
curl -fsS https://your-domain.com/health
```

Use `STAGING=1` while rehearsing certificate issuance, then issue the production certificate. Do not send users to the temporary self-signed certificate.

- Log in as admin once, then remove `ADMIN_PASSWORD` from `.env` and run `docker compose up -d backend`.
- Request a password reset for a test account and confirm actual SMTP delivery.
- In Razorpay, configure the webhook `https://your-domain.com/api/v1/webhooks/razorpay` and the same secret as `RAZORPAY_WEBHOOK_SECRET`. Subscribe to captured/failed/order-paid and refund events handled by `WebhookController`.
- Run a small live payment and refund on staging/live credentials. Confirm the plan activates only after signature verification and that refunding an older payment does not cancel a newer, unrelated subscription.
- The current product has manual renewal only. Do not advertise recurring billing unless a real Razorpay Subscriptions/recurring implementation is added.

### Backup and update

```bash
cd /opt/freshmcalc/infrastructure
docker compose exec -T postgres /backup/backup.sh
docker compose exec -T postgres /backup/verify-backup.sh
```

Schedule both commands and copy dumps to a separate provider/device. A local backup on the same VPS is not disaster recovery.

For later releases:

```bash
cd /opt/freshmcalc/infrastructure
./scripts/deploy.sh
```

The script pulls with `--ff-only`, requires a running PostgreSQL service and a successful pre-deploy backup, rebuilds, and waits for health. Review migrations and take an extra off-site backup before every release.

A restore is destructive. Stop the API first and use the exact dump path:

```bash
docker compose stop backend
docker compose exec -T postgres /backup/restore.sh /backups/<file>.sql.gz
docker compose start backend
docker compose ps
```

## 6. Android AAB and Google Play release

### Build the release bundle

1. Deploy and smoke-test the HTTPS API first. The native shell bundles the web assets locally and calls the API from `VITE_API_BASE`; it must not call `localhost` from a user's phone.
2. Confirm `frontend/.env.native` points to your real domain, or override it explicitly:

   ```bash
   cd frontend
   npm ci
   VITE_API_BASE=https://your-domain.com/api/v1 npm run build:app
   npx cap sync android
   npx cap open android
   ```

3. Use Android Studio Meerkat 2024.3.1 Patch 1 or newer. The project uses AGP 8.9.1, Gradle 8.11.1 and compile/target SDK 36. Install Android SDK 36 when prompted.
4. Confirm the unique application ID (`com.freshmcalc.app` by default), `versionName`, and increment `versionCode` for every upload.
5. In Android Studio choose **Build → Generate Signed Bundle / APK → Android App Bundle → release**. Keep the upload keystore and passwords outside Git, with secure backups. Enable Play App Signing in Play Console.
6. Install the internal-test build on real low-end and current Android devices before submitting anywhere.

Official compatibility references:

- https://developer.android.com/build/releases/about-agp
- https://support.google.com/googleplay/android-developer/answer/11926878?hl=en

As of this audit, Play requires new apps/updates to target Android 16 (API 36) from 31 August 2026. Recheck the policy on the actual submission date.

### Play Console sequence

1. Create the app, select the correct default language and Business category, and complete all dashboard setup items.
2. Upload the signed `.aab` to **Internal testing**. Test login, free/paid entitlements, rates/history, calculator/save/PDF share, offline error handling, back navigation and account deletion.
3. Run a **closed test** before production. For a qualifying personal developer account created after 13 November 2023, Play's current rule is at least **12 opted-in testers continuously for 14 days**, followed by an application for production access. Organization/other account types can have different requirements—follow what the account's Console shows.
4. Complete the store listing: 512×512 icon, 1024×500 feature graphic, accurate screenshots, short/full description, support email and required contact details.
5. Complete content rating, target audience (18+ for this business tool), ads declaration and every other App content form.
6. Complete **Data safety** from actual behavior, not from a template. Review account identifiers (name/email/phone), company/profile data, saved cost sheets/user content, purchase/order history, diagnostics/logs, encryption in transit, Razorpay/SMTP/hosting SDK/provider practices, retention and deletion. Answers must match the deployed privacy policy.
7. Supply working public URLs for `/privacy` and `/delete-account`. Keep the in-app Settings deletion path working as well. Test both the signed-in deletion flow and the “can't sign in” support process; the support mailbox must be monitored.
8. Native checkout is currently hidden. Users with an existing web-purchased fixed-term plan can sign in and use it. Recheck current Play billing/external-purchase rules before adding any price, purchase CTA or external payment link to the native experience.
9. Submit for review. After approval, use a staged production rollout and monitor crashes, API 5xx, payment activation and refund behavior before increasing rollout.

Official policy/release references:

- Closed testing: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en
- Release tracks: https://support.google.com/googleplay/android-developer/answer/9859348?hl=en

**Play approval cannot be guaranteed by this repository.** Console declarations, deployed behavior, policies and reviewer findings at submission time are authoritative.
