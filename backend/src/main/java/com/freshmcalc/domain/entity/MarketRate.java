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
 * Dubai market rate for a product variety. The source of truth for subscriber-facing pricing.
 * Never Indian domestic prices.
 */
@Entity
@Table(name = "market_rates")
public class MarketRate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variety_id", nullable = false)
    private ProductVariety productVariety;

    @Column(name = "market_name", nullable = false, length = 150)
    private String marketName = "Dubai, UAE"; // e.g. Dubai Wholesale Market

    @Column(name = "country", nullable = false, length = 100)
    private String country = "UAE";

    @Column(name = "city", nullable = false, length = 100)
    private String city = "Dubai";

    @Column(name = "price_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceAmount; // in currency

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "AED";

    @Column(name = "pricing_unit", nullable = false, length = 50)
    private String pricingUnit; // per kg, per box, per carton, per tonne

    @Column(name = "packaging_details", length = 255)
    private String packagingDetails;

    @Column(name = "origin_country", length = 100)
    private String originCountry;

    @Column(name = "effective_date_time", nullable = false)
    private Instant effectiveDateTime;

    @Column(name = "last_updated")
    private Instant lastUpdated;

    @Column(name = "data_source", length = 200)
    private String dataSource; // ADMIN, EXTERNAL_FEED, etc.

    @Column(name = "source_reference", length = 255)
    private String sourceReference;

    @Column(name = "is_automatically_fetched", nullable = false)
    private Boolean automaticallyFetched = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RateStatus status = RateStatus.DRAFT; // DRAFT, PUBLISHED, STALE, ARCHIVED

    public ProductVariety getProductVariety() { return productVariety; }
    public void setProductVariety(ProductVariety productVariety) { this.productVariety = productVariety; }

    public String getMarketName() { return marketName; }
    public void setMarketName(String marketName) { this.marketName = marketName; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPricingUnit() { return pricingUnit; }
    public void setPricingUnit(String pricingUnit) { this.pricingUnit = pricingUnit; }

    public String getPackagingDetails() { return packagingDetails; }
    public void setPackagingDetails(String packagingDetails) { this.packagingDetails = packagingDetails; }

    public String getOriginCountry() { return originCountry; }
    public void setOriginCountry(String originCountry) { this.originCountry = originCountry; }

    public Instant getEffectiveDateTime() { return effectiveDateTime; }
    public void setEffectiveDateTime(Instant effectiveDateTime) { this.effectiveDateTime = effectiveDateTime; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public String getSourceReference() { return sourceReference; }
    public void setSourceReference(String sourceReference) { this.sourceReference = sourceReference; }

    public Boolean getAutomaticallyFetched() { return automaticallyFetched; }
    public void setAutomaticallyFetched(Boolean automaticallyFetched) { this.automaticallyFetched = automaticallyFetched; }

    public RateStatus getStatus() { return status; }
    public void setStatus(RateStatus status) { this.status = status; }

}
