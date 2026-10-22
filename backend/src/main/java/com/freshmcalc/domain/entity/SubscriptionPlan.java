package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Subscription plan with price and entitlements. Prices stored in INR (Razorpay default INR).
 */
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name; // Monthly, Quarterly, Yearly

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "price_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "INR";

    @Column(name = "billing_cycle", nullable = false, length = 20)
    private String billingCycle; // MONTHLY, QUARTERLY, YEARLY

    @Column(name = "razorpay_plan_id", length = 100)
    private String razorpayPlanId;

    @Column(name = "dubai_rates_access")
    private Boolean dubaiRatesAccess = true;

    @Column(name = "calculator_access")
    private Boolean calculatorAccess = true;

    @Column(name = "pdf_export_access")
    private Boolean pdfExportAccess = true;

    @Column(name = "saved_calculations_access")
    private Boolean savedCalculationsAccess = true;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }

    public String getRazorpayPlanId() { return razorpayPlanId; }
    public void setRazorpayPlanId(String razorpayPlanId) { this.razorpayPlanId = razorpayPlanId; }

    public Boolean getDubaiRatesAccess() { return dubaiRatesAccess; }
    public void setDubaiRatesAccess(Boolean dubaiRatesAccess) { this.dubaiRatesAccess = dubaiRatesAccess; }

    public Boolean getCalculatorAccess() { return calculatorAccess; }
    public void setCalculatorAccess(Boolean calculatorAccess) { this.calculatorAccess = calculatorAccess; }

    public Boolean getPdfExportAccess() { return pdfExportAccess; }
    public void setPdfExportAccess(Boolean pdfExportAccess) { this.pdfExportAccess = pdfExportAccess; }

    public Boolean getSavedCalculationsAccess() { return savedCalculationsAccess; }
    public void setSavedCalculationsAccess(Boolean savedCalculationsAccess) { this.savedCalculationsAccess = savedCalculationsAccess; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
