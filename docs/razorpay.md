# Razorpay Integration — Test Mode

FreshmCalc uses Razorpay for subscriptions and payments. Integration is backend-driven; secret keys are never exposed to the frontend.

## Workflow

1. User selects a subscription plan (Monthly / Quarterly / Yearly).
2. Frontend calls backend to create a Razorpay order (or subscription).
3. User completes Razorpay checkout (frontend uses `rzp_test_` key id only).
4. Backend verifies the Razorpay payment signature.
5. Razorpay webhooks (`/api/v1/webhooks/razorpay`) update payment/subscription state idempotently.
6. Verified successful payments activate entitlements.
7. Users view receipts, payment status and expiry dates.

## Configuration

Backend environment variables:

```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_TEST_MODE=true
```

- `RAZORPAY_TEST_MODE=true` (default): uses Razorpay test credentials.
- Set to `false` and provide live keys for production.

## Webhook endpoint

`POST /api/v1/webhooks/razorpay`

Verifies `X-Razorpay-Signature` using the raw request body and `RAZORPAY_WEBHOOK_SECRET`. Event processing is idempotent via the `webhook_events` table (unique `event_id`).

## Important security rules

- Never activate paid access based only on a frontend redirect.
- Never expose `RAZORPAY_KEY_SECRET` in frontend code.
- Verify webhook signatures on the raw body.
- Handle failed, pending, cancelled, expired and refunded payments.
- If live credentials or approval are missing, show an explicit configuration-required state.

## Test cards (Razorpay test mode)

Use Razorpay test card details from Razorpay docs for successful/failed payment scenarios.
