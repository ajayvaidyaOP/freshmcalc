-- Establish one truthful starting point for existing published rates. New
-- publication/update snapshots are written by MarketRateService after this migration.
INSERT INTO market_rate_history (
    market_rate_id, price_amount, currency, pricing_unit, effective_date_time,
    status, changed_by, change_reason, created_at
)
SELECT
    mr.id, mr.price_amount, mr.currency, mr.pricing_unit, mr.effective_date_time,
    mr.status, mr.updated_by, 'Baseline published rate',
    COALESCE(mr.last_updated, mr.effective_date_time, NOW())
FROM market_rates mr
WHERE mr.status = 'PUBLISHED'
  AND LOWER(TRIM(mr.city)) = 'dubai'
  AND NOT EXISTS (
      SELECT 1 FROM market_rate_history h WHERE h.market_rate_id = mr.id
  );
