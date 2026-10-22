# Razorpay subscriptions — how checkout works

FreshmCalc uses **server-created orders + server-side signature verification**.
Secrets never reach the browser, and a plan is unlocked only when Razorpay's
HMAC signature is verified on the backend. Each order buys a fixed access term; renewal is a separate manual purchase, not an automatic Razorpay subscription charge.

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
| POST | `/api/v1/webhooks/razorpay` | Razorpay (HMAC) | capture / failure / refund reconciliation |
| GET | `/api/v1/auth/me` | user | profile + `planEntitlements` |
| PATCH | `/api/v1/auth/me` | user | update profile |
| DELETE | `/api/v1/auth/me` | user | delete account (cancels plan) |
| POST | `/api/v1/auth/forgot-password` | public | email a reset link (always 200) |
| POST | `/api/v1/auth/reset-password` | public | set a new password from the token |

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

`POST /api/v1/webhooks/razorpay` is public (no JWT) but every request is
verified against `RAZORPAY_WEBHOOK_SECRET` with HMAC-SHA256 on the **raw** body.
The endpoint rejects everything when the secret is empty, so set it before
going live.

In the Razorpay dashboard → Settings → Webhooks:

| Field | Value |
|---|---|
| URL | `https://your-domain.com/api/v1/webhooks/razorpay` |
| Secret | same value as `RAZORPAY_WEBHOOK_SECRET` |
| Active events | `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, `refund.processed`, `payment.refunded` |

Behaviour:

| Event | What the server does |
|---|---|
| `payment.captured`, `order.paid` | Finds the payment by order id, marks it SUCCESS, sets `paidAt`, activates the plan from the `PLAN:<id>` description. Already-successful payments are untouched. |
| `payment.failed` | Marks the payment FAILED with the gateway reason. Never downgrades a successful payment. |
| `refund.created` / `refund.processed` / `payment.refunded` | Marks that payment REFUNDED and cancels only the active subscription linked to that payment; a newer unrelated plan is left alone. |

Every event id (`X-Razorpay-Event-Id`, falling back to a hash of the body) is
stored in `webhook_events`; a duplicate is acknowledged with 200 and not
reprocessed. A bad signature returns 400 and Razorpay retries.

Webhooks are **reconciliation**, not the only activation path: the in-app
`POST /payments/verify` is primary, so a user is unlocked even if a webhook is
delayed. Conversely, a user who closes the browser before `verify` still gets
their plan when `payment.captured` arrives.

## App store builds

The native shells intentionally hide checkout:

| Platform | Behaviour |
|---|---|
| Android app | Existing-plan sign-in/status and support contact; no in-app checkout |
| iOS app | Same — reduces Guideline 3.1.1 risk but does not guarantee review approval |
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
- [ ] Same webhook delivered twice → second is a no-op (check `webhook_events`)
- [ ] `payment.failed` → payment FAILED, no subscription
- [ ] `refund.processed` for the current payment → payment REFUNDED **and** `GET /subscription` shows no active plan
- [ ] Buy a newer plan, then refund the older payment → the newer plan remains active
- [ ] Close the browser immediately after paying → plan appears from the webhook alone
- [ ] Refund/chargeback notifications enabled in the Razorpay dashboard

## Security rules

- Never trust an amount, plan price or “success” flag from the browser.
- Never expose `RAZORPAY_KEY_SECRET`/`WEBHOOK_SECRET` in frontend code.
- Verify webhook signatures on the **raw** request body.
- Keep `RAZORPAY_TEST_MODE=true` until KYC/live keys are approved.
