package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * User subscription linked to a plan and Razorpay subscription (if applicable).
 */
@Entity
@Table(name = "subscriptions")
public class Subscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Column(name = "razorpay_subscription_id", length = 100)
    private String razorpaySubscriptionId;

    @Column(name = "razorpay_customer_id", length = 100)
    private String razorpayCustomerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubscriptionStatus status = SubscriptionStatus.INACTIVE; // ACTIVE, INACTIVE, EXPIRED, CANCELLED, PAST_DUE

    @Column(name = "current_period_start")
    private Instant currentPeriodStart;

    @Column(name = "current_period_end")
    private Instant currentPeriodEnd;

    @Column(name = "amount_paid", precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "cancel_at_period_end")
    private Boolean cancelAtPeriodEnd = false;

    @Column(name = "ended_at")
    private Instant endedAt;

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public SubscriptionPlan getPlan() { return plan; }
    public void setPlan(SubscriptionPlan plan) { this.plan = plan; }

    public String getRazorpaySubscriptionId() { return razorpaySubscriptionId; }
    public void setRazorpaySubscriptionId(String razorpaySubscriptionId) { this.razorpaySubscriptionId = razorpaySubscriptionId; }

    public String getRazorpayCustomerId() { return razorpayCustomerId; }
    public void setRazorpayCustomerId(String razorpayCustomerId) { this.razorpayCustomerId = razorpayCustomerId; }

    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { this.status = status; }

    public Instant getCurrentPeriodStart() { return currentPeriodStart; }
    public void setCurrentPeriodStart(Instant currentPeriodStart) { this.currentPeriodStart = currentPeriodStart; }

    public Instant getCurrentPeriodEnd() { return currentPeriodEnd; }
    public void setCurrentPeriodEnd(Instant currentPeriodEnd) { this.currentPeriodEnd = currentPeriodEnd; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Boolean getCancelAtPeriodEnd() { return cancelAtPeriodEnd; }
    public void setCancelAtPeriodEnd(Boolean cancelAtPeriodEnd) { this.cancelAtPeriodEnd = cancelAtPeriodEnd; }

    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }
}
