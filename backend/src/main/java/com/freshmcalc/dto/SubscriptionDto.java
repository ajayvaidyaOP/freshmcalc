package com.freshmcalc.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class SubscriptionDto {

    public record SubscriptionPlanResponse(
        Long id,
        String name,
        String description,
        BigDecimal priceAmount,
        String currency,
        String billingCycle,
        String razorpayPlanId,
        Boolean dubaiRatesAccess,
        Boolean calculatorAccess,
        Boolean pdfExportAccess,
        Boolean savedCalculationsAccess,
        Boolean active,
        Integer sortOrder
    ) {}

    public record SubscriptionResponse(
        Long id,
        Long planId,
        String planName,
        String razorpaySubscriptionId,
        String status,
        Instant currentPeriodStart,
        Instant currentPeriodEnd,
        BigDecimal amountPaid,
        String currency,
        Boolean active
    ) {}

    public record CreateSubscriptionRequest(
        Long planId
    ) {}

    public record PlanEntitlements(
        Boolean dubaiRatesAccess,
        Boolean calculatorAccess,
        Boolean pdfExportAccess,
        Boolean savedCalculationsAccess
    ) {}
}
