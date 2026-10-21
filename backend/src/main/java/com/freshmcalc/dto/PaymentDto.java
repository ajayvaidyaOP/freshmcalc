package com.freshmcalc.dto;

import java.math.BigDecimal;

public class PaymentDto {

    public record CreateOrderRequest(
        Long planId,
        String amount,
        String currency
    ) {}

    public record OrderResponse(
        String orderId,
        String amount,
        String currency,
        String keyId,
        String subscriptionId
    ) {}

    public record VerifyPaymentRequest(
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature
    ) {}

    public record PaymentResponse(
        Long id,
        String razorpayOrderId,
        String razorpayPaymentId,
        BigDecimal amount,
        String currency,
        String status,
        String description
    ) {}
}
