package com.freshmcalc.domain.entity;

import java.math.BigDecimal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * Configurable expense component template used in cost calculations.
 */
@Entity
@Table(name = "expense_templates")
public class ExpenseTemplate extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "category", nullable = false, length = 100)
    private String category; // PACKING, INLAND_TRANSPORT, CHA, OCEAN_FREIGHT, INSURANCE, COMMISSION, TAX, OTHER

    @Column(name = "default_amount", precision = 12, scale = 2)
    private BigDecimal defaultAmount;

    @Column(name = "default_currency", length = 10)
    private String defaultCurrency = "INR";

    @Column(name = "is_percentage")
    private Boolean isPercentage = false;

    @Column(name = "percentage_base", length = 100)
    private String percentageBase; // e.g. product_cost, freight

    @Column(name = "is_applicable_by_default")
    private Boolean applicableByDefault = true;

    @Column(name = "notes", length = 500)
    private String notes;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getDefaultAmount() { return defaultAmount; }
    public void setDefaultAmount(BigDecimal defaultAmount) { this.defaultAmount = defaultAmount; }

    public String getDefaultCurrency() { return defaultCurrency; }
    public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }

    public Boolean getIsPercentage() { return isPercentage; }
    public void setIsPercentage(Boolean isPercentage) { this.isPercentage = isPercentage; }

    public String getPercentageBase() { return percentageBase; }
    public void setPercentageBase(String percentageBase) { this.percentageBase = percentageBase; }

    public Boolean getApplicableByDefault() { return applicableByDefault; }
    public void setApplicableByDefault(Boolean applicableByDefault) { this.applicableByDefault = applicableByDefault; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
