package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Immutable snapshot of a market rate at a point in time, for audit and price-history.
 */
@Entity
@Table(name = "market_rate_history")
public class MarketRateHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "market_rate_id", nullable = false)
    private MarketRate marketRate;

    @Column(name = "price_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceAmount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(name = "pricing_unit", nullable = false, length = 50)
    private String pricingUnit;

    @Column(name = "effective_date_time", nullable = false)
    private Instant effectiveDateTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RateStatus status;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Column(name = "change_reason", length = 255)
    private String changeReason;

    public MarketRate getMarketRate() { return marketRate; }
    public void setMarketRate(MarketRate marketRate) { this.marketRate = marketRate; }

    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPricingUnit() { return pricingUnit; }
    public void setPricingUnit(String pricingUnit) { this.pricingUnit = pricingUnit; }

    public Instant getEffectiveDateTime() { return effectiveDateTime; }
    public void setEffectiveDateTime(Instant effectiveDateTime) { this.effectiveDateTime = effectiveDateTime; }

    public RateStatus getStatus() { return status; }
    public void setStatus(RateStatus status) { this.status = status; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public String getChangeReason() { return changeReason; }
    public void setChangeReason(String changeReason) { this.changeReason = changeReason; }
}
