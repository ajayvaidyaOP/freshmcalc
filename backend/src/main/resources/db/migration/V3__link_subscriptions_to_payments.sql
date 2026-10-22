-- Preserve the exact payment-to-subscription relationship so a refund can
-- revoke only the entitlement unlocked by that payment.
ALTER TABLE subscriptions
    ADD COLUMN source_payment_id BIGINT REFERENCES payments(id);

CREATE UNIQUE INDEX ux_subscriptions_source_payment
    ON subscriptions(source_payment_id)
    WHERE source_payment_id IS NOT NULL;
