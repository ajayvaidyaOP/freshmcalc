package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Verified freight quote for a route and container type. Never invented.
 */
@Entity
@Table(name = "freight_quotes")
public class FreightQuote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id", nullable = false)
    private ShippingRoute route;

    @Column(name = "container_type", nullable = false, length = 50)
    private String containerType; // 20FT, 40FT, 40HC, REEFER

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "USD";

    @Column(name = "source", length = 255)
    private String source;

    @Column(name = "effective_date", nullable = false)
    private Instant effectiveDate;

    @Column(name = "expiry_date")
    private Instant expiryDate;

    public ShippingRoute getRoute() { return route; }
    public void setRoute(ShippingRoute route) { this.route = route; }

    public String getContainerType() { return containerType; }
    public void setContainerType(String containerType) { this.containerType = containerType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Instant getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(Instant effectiveDate) { this.effectiveDate = effectiveDate; }

    public Instant getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }
}
