# Razorpay subscriptions — how checkout works

FreshmCalc uses **server-created orders + server-side signature verification**.
Secrets never reach the browser, and a plan is unlocked only when Razorpay's
HMAC signature is verified on the backend.

## Flow

```
Browser / app                     Backend                        Razorpay
     │                               │                              │
     │ POST /payments/order {planId} │                              │
     ├──────────────────────────────►│  price read from DB          │
     │                               ├─ create order ──────────────►│
     │                               │◄──────── order id ───────────┤
     │◄── {orderId, amount, keyId} ──┤  payment row = PENDING       │
     │                               │                              │
     │  Razorpay Checkout (web)      │                              │
     ├──────────────────────────────────────────────────────────────►│
     │◄──────── payment_id + signature ─────────────────────────────┤
     │                               │                              │
     │ POST /payments/verify         │                              │
     ├──────────────────────────────►│ verify HMAC-SHA256           │
     │                               │ mark SUCCESS                 │
     │                               │ activate plan + entitlements │
     │◄── payment response ──────────┤                              │
     │ GET /auth/me → unlocks UI     │                              │
```

Key properties:

- **Amount comes from `subscription_plans.price_amount`** (stored in paise,
  e.g. `49900` = ₹499). The browser cannot choose what to pay.
- **Idempotent**: verifying an already-successful payment returns the stored
  record instead of charging again.
- **Ownership check**: a payment can only be verified by the user it belongs to.
- **No silent unlock**: selecting a plan without a verified payment changes
  nothing. `POST /subscription-plans/subscribe` was removed for this reason.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/subscription-plans` | public | plan catalogue (pricing page) |
| GET | `/api/v1/subscription-plans/subscription` | user | current subscription |
| POST | `/api/v1/payments/order` | user | create Razorpay order |
| POST | `/api/v1/payments/verify` | user | verify signature + activate |
| GET | `/api/v1/auth/me` | user | profile + `planEntitlements` |

## Configuration

```properties
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret   # optional, for reconciliation
RAZORPAY_TEST_MODE=true
```

- Missing keys → the app still runs; checkout returns a clear
  “payments are not configured” message and nothing is activated.
- `RAZORPAY_TEST_MODE=false` only with live keys.
- `RAZORPAY_KEY_ID` is the only payment value sent to the frontend.

## Webhooks

`POST /api/v1/webhooks/razorpay` verifies `X-Razorpay-Signature` on the raw
body and stores each event once (`webhook_events.event_id` is unique).

Set the URL in the Razorpay dashboard to:

```
https://your-domain.com/api/v1/webhooks/razorpay
```

Use webhooks for **reconciliation and refunds** (cancelled / failed /
refunded), not as the only activation path — the in-app `verify` call is the
primary path, so a user is unlocked even if a webhook is delayed.

## App store builds

The native shells intentionally hide checkout:

| Platform | Behaviour |
|---|---|
| Android app | “Manage your plan at freshmcalc.com”; no in-app purchase |
| iOS app | Same — avoids Guideline 3.1.1 rejection |
| Web / PWA | Full Razorpay checkout |

If you later want in-app purchases, integrate **Google Play Billing** and
**StoreKit 2** (or RevenueCat), validate receipts server-side, and map the
store subscription to the same `subscriptions` table.

## Testing

Razorpay test mode: use test keys and Razorpay's official test cards / UPI IDs.
Verify all of these before going live:

- [ ] Successful payment → plan active, `/auth/me` returns `true` entitlements
- [ ] Cancelled checkout → no subscription, no charge
- [ ] Failed payment → order stays PENDING/FAILED, nothing unlocked
- [ ] Replaying the same verify call → no duplicate subscription
- [ ] Verifying someone else's order → 400
- [ ] Webhook with a bad signature → 400
- [ ] Refund handling configured in the Razorpay dashboard

## Security rules

- Never trust an amount, plan price or “success” flag from the browser.
- Never expose `RAZORPAY_KEY_SECRET`/`WEBHOOK_SECRET` in frontend code.
- Verify webhook signatures on the **raw** request body.
- Keep `RAZORPAY_TEST_MODE=true` until KYC/live keys are approved.
