package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Manually approved or provider-sourced exchange rate with timestamp and source.
 */
@Entity
@Table(
    name = "exchange_rates",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_exchange_rates_pair_date",
        columnNames = {"from_currency", "to_currency", "effective_date"}
    )
)
public class ExchangeRate extends BaseEntity {

    @Column(name = "from_currency", nullable = false, length = 3)
    private String fromCurrency;

    @Column(name = "to_currency", nullable = false, length = 3)
    private String toCurrency;

    @Column(name = "rate", nullable = false, precision = 19, scale = 6)
    private BigDecimal rate; // 1 fromCurrency = rate toCurrency

    @Column(name = "effective_date", nullable = false)
    private Instant effectiveDate;

    @Column(name = "source", length = 255)
    private String source;

    @Column(name = "is_manually_approved")
    private Boolean manuallyApproved = false;

    public String getFromCurrency() { return fromCurrency; }
    public void setFromCurrency(String fromCurrency) { this.fromCurrency = fromCurrency; }

    public String getToCurrency() { return toCurrency; }
    public void setToCurrency(String toCurrency) { this.toCurrency = toCurrency; }

    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }

    public Instant getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(Instant effectiveDate) { this.effectiveDate = effectiveDate; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Boolean getManuallyApproved() { return manuallyApproved; }
    public void setManuallyApproved(Boolean manuallyApproved) { this.manuallyApproved = manuallyApproved; }
}
