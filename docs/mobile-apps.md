# FreshmCalc on mobile — Play Store, App Store and installable web app

FreshmCalc ships as **one React codebase** in three wrappers:

| Wrapper | What it is | Status |
|---|---|---|
| **Installable web app (PWA)** | Manifest + service worker + install prompt. Android/desktop get a native install prompt; iPhone uses Safari → Share → Add to Home Screen. | ✅ in this repo |
| **Android app (Play Store)** | Capacitor shell (`frontend/android/`) around the same bundle, signed as an `.aab` | 🟡 source configured — signed build + device tests still required |
| **iOS app (App Store)** | Capacitor shell (`frontend/ios/`) built in Xcode | 🟡 source configured — archive + device tests still required |

See [`production-readiness.md`](production-readiness.md) for the evidence-based release gates and the current API/Play policy checklist.

The PWA is not a placeholder: it installs with an icon, opens full-screen,
works offline for the shell and keeps the calculator draft on the device.
Store listings add distribution and trust — they do not change the product.

---

## 1. What is already wired

```
frontend/
├── public/manifest.webmanifest      # name, icons, shortcuts, standalone display
├── public/sw.js                     # offline shell; never caches /api responses
├── public/offline.html              # friendly offline fallback
├── public/icons/                    # 96/192/512 + maskable + apple-touch
├── capacitor.config.ts              # appId com.freshmcalc.app
├── .env.native                      # native builds call https://freshmcalc.com/api/v1
├── assets/                          # icon + splash sources
├── android/                         # generated Android Studio project
├── ios/                             # generated Xcode project
└── src/components/common/InstallPrompt.tsx
```

Brand icons and splash screens are already generated for every Android density
(including the adaptive/maskable icon) and for the iOS 1024px icon + launch
images, with the forest-green theme applied to the native status bar.

- `npm run build` → normal web build (`/api/v1` relative).
- `npm run build:app` → native build (absolute API URL, `--mode native`).
  The URL comes from `frontend/.env.native` (`https://freshmcalc.com/api/v1`).
  Deploying on another domain? Override it without editing the file (process env
  wins over `.env` files):
  `VITE_API_BASE=https://your-domain.com/api/v1 npm run build:app`
- `npm run app:android` → build + `cap sync android` + open Android Studio.
- `npm run app:ios` → build + `cap sync ios` + open Xcode.
- In the native shell, subscription checkout is **hidden** (store rules —
  see §5); the plan screen shows status only.
- PDF quotations work on phones: `src/lib/pdf.ts` writes the file to the app
  cache with `@capacitor/filesystem` and opens the system share sheet
  (`@capacitor/share`), because a WebView cannot download a blob. On the web it
  stays a normal download.
- Android hardware back walks the router history before exiting.

---

## 2. Android → Google Play (first release)

**Prerequisites:** Android Studio Meerkat 2024.3.1 Patch 1 or newer (with its compatible bundled JDK), Android SDK 36, a Google Play Console account (one-time US$25), and the HTTPS API already deployed and smoke-tested. The shell bundles the React build locally; it calls the hosted API rather than loading the website as a remote wrapper.

```bash
cd frontend
npm install
npm run app:android         # build:app + cap sync android + open Android Studio
# manual equivalent: npm run build:app && npx cap sync android && npx cap open android
```

The `frontend/android/` project is already generated and committed. It uses AGP 8.9.1, Gradle wrapper 8.11.1 and compile/target SDK 36.

In Android Studio:

1. **Build → Generate Signed Bundle / APK → Android App Bundle.**
2. Create an **upload keystore** (`.jks`) once, store it in a password manager
   plus a secure backup. Losing it can block updates until a key-reset/recovery process is completed.
   Never commit it — add `*.jks` / `*.keystore` to `.gitignore`.
3. Build a **release** `.aab` (Play requires AAB, not APK).
4. Play Console → **Create app** → fill store listing:
   - App name: `FreshmCalc — Dubai Rates`
   - Short description (≤80 chars), full description, category *Business*
   - App icon 512×512 PNG (use `frontend/public/icons/icon-512.png`)
   - Feature graphic 1024×500 PNG
   - At least 2 phone screenshots (1080×1920 or similar, portrait)
   - Privacy policy URL (required — see §6)
5. **App content** forms: content rating questionnaire, target audience,
   ads declaration (no ads), and an accurate Data safety form covering account/profile data, saved cost sheets, purchase/order history, diagnostics, providers, encryption and deletion.
6. **Testing → Internal testing** first, add your own email, install from the
   opt-in link and run the checklist in §7.
7. Run a **closed test**, then apply for/promote to production as the Console allows. Qualifying personal developer accounts created after 13 November 2023 currently need at least **12 opted-in testers for 14 continuous days** before production access. Review timelines vary.

Play policy notes:

- **Account deletion** is mandatory for apps that let users create accounts. Play requires both an in-app deletion path and a functional external web resource. Test Settings → Delete account and the public `/delete-account` page before submission (see §6).
- If you later sell subscriptions *inside* the Android app, Google Play Billing
  is required for digital goods. Keeping the checkout on the website (as now)
  avoids the 15% store fee but must not link out from inside the app.

---

## 3. iOS → App Store

**Prerequisites:** macOS with Xcode 15+, an Apple Developer Program membership
(US$99/year), CocoaPods (`sudo gem install cocoapods`) and an App Store Connect
record.

```bash
cd frontend
npm install
npm run app:ios             # build:app + cap sync ios + open Xcode
# first time on a new machine: sudo gem install cocoapods && npx cap sync ios
```

The `frontend/ios/` project is already generated and committed.

In Xcode:

1. Select the **App** target → *Signing & Capabilities* → your team and a
   unique bundle id (default `com.freshmcalc.app`).
2. Set version (`MARKETING_VERSION`) and build number; increment the build
   number for every upload.
3. *Product → Archive* → **Distribute App → App Store Connect**.
4. App Store Connect → My Apps → **+** → fill:
   - Name, subtitle, category *Business*, keywords
   - Privacy policy URL, support URL
   - Screenshots: 6.7" (iPhone 15/16 Pro Max) and 6.5" at minimum; iPad only if
     you enable iPad support
   - App Privacy: declare email/name/company collection and account usage
5. Test with **TestFlight** (internal testers) before submitting for review.

Apple review notes that matter for this app:

- **Digital subscriptions unlock app functionality**, so Apple generally
  requires **In-App Purchase** (Guideline 3.1.1) if the user can subscribe
  inside the app. Our build deliberately hides checkout on iOS and tells users
  to manage the plan on the website. Do **not** add a "Subscribe" button or an
  external payment link inside the iOS build — that gets rejected unless the
  app qualifies as a “reader app” (it does not: FreshmCalc is a business tool).
- Users who subscribed on the web can sign in and use everything — this is
  allowed for multiplatform services (Guideline 3.1.3(b)).
- If you later want in-app purchases, use **StoreKit 2 + server-side receipt
  verification** (or RevenueCat) and expect Apple's 15–30% commission.
- Account deletion is required (Guideline 5.1.1(v)) for account-based apps.

---

## 4. One codebase, three builds

```bash
# web (Docker / nginx)
npm run build

# native wrappers
npm run build:app
npx cap sync
```

By default the shell **bundles the built app** (`dist/`) and calls the hosted
API from `.env.native` — the stores expect a self-contained app, not a remote
website wrapper. For live-reload against a dev server:

```bash
CAP_SERVER_URL=http://<your-lan-ip>:5173 npx cap sync android
```

Remove that env var (and re-sync) before building a release.

**Versioning:** keep `package.json`, `android/app/build.gradle`
(`versionName`/`versionCode`) and Xcode's marketing version in sync. Suggested:
`1.0.0` for the first store release.

---

## 5. Monetisation model for stores

| Surface | Payment | Notes |
|---|---|---|
| Web / PWA | Razorpay (UPI, cards, net-banking) | current, lowest friction in India |
| Android app | **no in-app purchase UI** (current) | avoids Play's billing policy; add Play Billing later |
| iOS app | **no in-app purchase UI** (current) | avoids Guideline 3.1.1 rejection |

Both native shells hide the plan catalogue, the checkout and every
"subscribe"/"buy" call to action (see `Subscription.tsx`, `PlanLock.tsx`). What
remains is factual: the current plan, its expiry, and a support email for plan
questions. That reduces store-policy risk for a companion app to an
existing SaaS account, but approval is not guaranteed. Recheck the current policy and the actual native screens before submission; do not introduce external checkout links or purchase CTAs.

Because subscriptions are server-side, a plan bought on the web unlocks the
Android app, the iOS app and the website at the same time — the app calls
`GET /api/v1/auth/me` and receives `planEntitlements`.

If you later want in-app purchases, integrate **StoreKit 2** and **Google Play
Billing** (RevenueCat wraps both), validate receipts server-side, and write the
result into the same `subscriptions` table. Never grant entitlements from the
client's "purchase succeeded" callback alone.

---

## 6. Before you publish — checklist

### Already in the repo

- [x] Privacy policy at `/privacy` — data collected, processors (Razorpay,
      SMTP, hosting), retention, DPDP rights, contact.
- [x] Terms at `/terms` — fixed-term plans/manual renewal, 7-day refund rule, liability, Pune
      jurisdiction (still requires owner/legal review against actual operations).
- [x] Signup consent linking both documents.
- [x] **Account deletion**: `DELETE /api/v1/auth/me` anonymises the user,
      cancels the plan and deletes saved sheets; Settings → Delete account has a
      type-`DELETE` confirmation; `/delete-account` is a **public** URL for the
      Play Console deletion field.
- [x] iOS privacy manifest (`ios/App/App/PrivacyInfo.xcprivacy`) — no tracking,
      declared contact/user-content/purchase data, UserDefaults + file-timestamp
      API reasons.
- [x] Android manifest: `allowBackup="false"`, `usesCleartextTraffic="false"`,
      `INTERNET` only, compile/target SDK 36.
- [x] Password-reset flow wired with no user enumeration; actual email delivery requires production SMTP verification.
- [x] Native Subscription screen hides the plan catalogue and checkout; audit every native marketing/pricing route again before submission.
- [x] Offline shell, installable PWA, app icons and splashes.

### You must do in the store consoles

- [ ] Privacy policy URL: `https://freshmcalc.com/privacy`
- [ ] Terms URL: `https://freshmcalc.com/terms`
- [ ] Account-deletion URL: `https://freshmcalc.com/delete-account`
- [ ] Support email **and** a phone number (Play requires both on the listing)
- [ ] Screenshots without real customer data (use demo mode)
- [ ] Play **Data safety** + Apple **App Privacy** answers must match
      `PrivacyInfo.xcprivacy` and `/privacy`: name, email, phone, user content
      (cost sheets), purchase history. All app functionality, none for tracking.
- [ ] Content rating questionnaire, target audience 18+, ads: none
- [ ] Apple: `ITSAppUsesNonExemptEncryption=false` already set (no export
      paperwork); App Review demo account with an active plan
- [ ] Release build points at `https://` only (already enforced)
- [ ] `JWT_SECRET`, `DB_PASSWORD`, Razorpay keys, `MAIL_*` set on the server
- [ ] Crash reporting (optional Sentry — see `deployment.md`) and analytics
      consent if you add analytics
- [ ] Database backups + one verified restore before the first paying customer
- [ ] Store builds tested on a real low-end Android phone and an iPhone

---

## 7. Smoke test on a real phone

1. Install from the store / home screen — icon and splash look correct.
2. Log in with a real account; check the plan badge.
3. Open **Dubai Live Rates** — AED prices load, freshness timer ticks.
4. Run an **export calculation** with your own numbers; verify the profit
   against the worked example in `docs/costing-formula.md`.
5. Save it, download the PDF, open the PDF from the phone's Files app.
6. Kill the app, reopen: calculator draft and saved sheets are still there.
7. Turn on airplane mode: the app opens, shows the offline message on data
   instead of a blank screen.
8. Android back button: navigates back, exits only from the dashboard.
9. Subscribe on the web in another tab → return to the app → locks disappear
   after the profile refresh (no re-login).

---

## 8. Common problems

| Symptom | Cause / fix |
|---|---|
| Native build shows “Could not reach the server” | `.env.native` not used — build with `npm run build:app`, then `npx cap sync` |
| iOS rejects external purchase link | Native shells already hide plan CTAs; don't add "buy on our website" links/prices to the iOS build |
| Play Console: “App bundle was signed with the wrong key” | Use the same upload keystore every release; enable Play App Signing |
| Blank white screen after splash | `webDir` mismatch — run `npx cap sync` after every build |
| Icons look cropped on Android | Use the maskable icon (`maskable-512.png`) and adaptive icon foreground |
| Service worker keeps old JS | Bump the `VERSION` in `public/sw.js` on release; it clears old caches |
| PDF not downloading in the native shell | Native uses `Filesystem` + `Share` (WebViews cannot download blobs); if the share sheet is empty, run `npx cap sync` after `npm install` so the plugins are registered |
