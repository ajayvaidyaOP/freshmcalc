package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/** Configured port-side charge. Applicability and provenance are stored with every amount. */
@Entity
@Table(name = "port_charges")
public class PortCharge extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "port_id", nullable = false)
    private Port port;

    @Column(name = "direction", nullable = false, length = 20)
    private String direction;

    @Column(name = "charge_category", nullable = false, length = 60)
    private String chargeCategory;

    @Column(name = "description", nullable = false, length = 180)
    private String description;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "charging_basis", nullable = false, length = 20)
    private String chargingBasis;

    @Column(name = "shipping_mode", nullable = false, length = 12)
    private String shippingMode = "SEA";

    @Column(name = "container_type", length = 30)
    private String containerType;

    @Column(name = "product_name", length = 150)
    private String productName;

    @Column(name = "conditions", length = 500)
    private String conditions;

    @Column(name = "effective_from", nullable = false)
    private Instant effectiveFrom;

    @Column(name = "effective_until")
    private Instant effectiveUntil;

    @Column(name = "source", length = 255)
    private String source;

    @Column(name = "last_verified_at")
    private Instant lastVerifiedAt;

    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus = "UNCONFIRMED";

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public Port getPort() { return port; }
    public void setPort(Port port) { this.port = port; }
    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }
    public String getChargeCategory() { return chargeCategory; }
    public void setChargeCategory(String chargeCategory) { this.chargeCategory = chargeCategory; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getChargingBasis() { return chargingBasis; }
    public void setChargingBasis(String chargingBasis) { this.chargingBasis = chargingBasis; }
    public String getShippingMode() { return shippingMode; }
    public void setShippingMode(String shippingMode) { this.shippingMode = shippingMode; }
    public String getContainerType() { return containerType; }
    public void setContainerType(String containerType) { this.containerType = containerType; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }
    public Instant getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(Instant effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public Instant getEffectiveUntil() { return effectiveUntil; }
    public void setEffectiveUntil(Instant effectiveUntil) { this.effectiveUntil = effectiveUntil; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Instant getLastVerifiedAt() { return lastVerifiedAt; }
    public void setLastVerifiedAt(Instant lastVerifiedAt) { this.lastVerifiedAt = lastVerifiedAt; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
