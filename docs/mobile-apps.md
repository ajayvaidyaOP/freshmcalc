# FreshmCalc on mobile — Play Store, App Store and installable web app

FreshmCalc ships as **one React codebase** in three wrappers:

| Wrapper | What it is | Status |
|---|---|---|
| **Installable web app (PWA)** | Manifest + service worker + install prompt. Android/desktop get a native install prompt; iPhone uses Safari → Share → Add to Home Screen. | ✅ in this repo |
| **Android app (Play Store)** | Capacitor shell (`frontend/android/`) around the same bundle, signed as an `.aab` | 🟡 project ready — build + submit |
| **iOS app (App Store)** | Capacitor shell (`frontend/ios/`) built in Xcode | 🟡 project ready — build + submit |

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
- `npm run app:android` → build + `cap sync android` + open Android Studio.
- `npm run app:ios` → build + `cap sync ios` + open Xcode.
- In the native shell, subscription checkout is **hidden** and replaced with
  “manage your plan on the web” (store rules — see §5).
- Android hardware back walks the router history before exiting.

---

## 2. Android → Google Play (first release)

**Prerequisites:** Android Studio (latest), JDK 21, a Google Play Console
account (one-time US$25), and the app already deployed at
`https://freshmcalc.com` (the shell loads it).

```bash
cd frontend
npm install
npm run app:android         # build:app + cap sync android + open Android Studio
# manual equivalent: npm run build:app && npx cap sync android && npx cap open android
```

The `frontend/android/` project is already generated and committed.

In Android Studio:

1. **Build → Generate Signed Bundle / APK → Android App Bundle.**
2. Create an **upload keystore** (`.jks`) once, store it in a password manager
   plus a secure backup. Losing it means you cannot ship updates.
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
   ads declaration (no ads), data safety (collects account email, name,
   company; data encrypted in transit; deletion available on request).
6. **Testing → Internal testing** first, add your own email, install from the
   opt-in link and run the checklist in §7.
7. Promote to **Closed → Production**. First review typically takes a few days.

Play policy notes:

- **Account deletion** is mandatory for apps that let users create accounts.
  Provide a deletion path inside the app or a clear web link before submission
  (currently a backlog item — see §6).
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
| Android app | website (current) or Play Billing (later) | Play Billing is required for in-app digital purchases |
| iOS app | **no in-app purchase UI** (current) | avoids Guideline 3.1.1 rejection; subscription is bought on the web |

Because subscriptions are server-side, a plan bought on the web unlocks the
Android app, the iOS app and the website at the same time — the app calls
`GET /api/v1/auth/me` and receives `planEntitlements`.

---

## 6. Before you publish — checklist

- [ ] Privacy policy page live at `https://freshmcalc.com/privacy`
      (account data, payment processor, retention, contact)
- [ ] Terms page at `https://freshmcalc.com/terms`
- [ ] **Account deletion** implemented (backend `DELETE /auth/me` + UI) or a
      clearly documented support process
- [ ] Support email and phone on the store listing
- [ ] Screenshots without real customer data (use demo mode)
- [ ] Play Data safety + Apple App Privacy answers match what the app collects
- [ ] Release build points at `https://` only (no cleartext)
- [ ] Crash reporting (e.g. Sentry) and analytics consent if you add them
- [ ] Store builds tested on a real low-end Android phone and an iPhone
- [ ] `JWT_SECRET`, `DB_PASSWORD`, Razorpay keys set on the server (not in Git)
- [ ] Database backups scheduled **before** the first paying customer

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
| iOS rejects external purchase link | Remove any “subscribe on web” hyperlink from the iOS build |
| Play Console: “App bundle was signed with the wrong key” | Use the same upload keystore every release; enable Play App Signing |
| Blank white screen after splash | `webDir` mismatch — run `npx cap sync` after every build |
| Icons look cropped on Android | Use the maskable icon (`maskable-512.png`) and adaptive icon foreground |
| Service worker keeps old JS | Bump the `VERSION` in `public/sw.js` on release; it clears old caches |
| PDF not downloading in the native shell | jsPDF saves via the WebView download manager; test on device and keep the file path inside the app sandbox |
