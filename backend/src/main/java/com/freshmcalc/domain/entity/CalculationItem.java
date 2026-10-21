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

/**
 * Line item within a calculation, recording amount, currency, and converted AED amount.
 */
@Entity
@Table(name = "calculation_items")
public class CalculationItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "calculation_id", nullable = false)
    private Calculation calculation;

    @Column(name = "expense_category", nullable = false, length = 100)
    private String expenseCategory; // PRODUCT_COST, PACKING, INLAND_TRANSPORT, CHA, OCEAN_FREIGHT, ...

    @Column(name = "expense_name", nullable = false, length = 150)
    private String expenseName;

    @Column(name = "amount", nullable = false, precision = 12, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(name = "amount_aed", precision = 12, scale = 4)
    private BigDecimal amountAed;

    @Enumerated(EnumType.STRING)
    @Column(name = "cost_group", nullable = false, length = 30)
    private CostGroup costGroup; // PURCHASE, ORIGIN, FREIGHT, DESTINATION, COMMISSION_TAX

    public Calculation getCalculation() { return calculation; }
    public void setCalculation(Calculation calculation) { this.calculation = calculation; }

    public String getExpenseCategory() { return expenseCategory; }
    public void setExpenseCategory(String expenseCategory) { this.expenseCategory = expenseCategory; }

    public String getExpenseName() { return expenseName; }
    public void setExpenseName(String expenseName) { this.expenseName = expenseName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getAmountAed() { return amountAed; }
    public void setAmountAed(BigDecimal amountAed) { this.amountAed = amountAed; }

    public CostGroup getCostGroup() { return costGroup; }
    public void setCostGroup(CostGroup costGroup) { this.costGroup = costGroup; }
}
