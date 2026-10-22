package com.freshmcalc.controller;

import com.freshmcalc.config.security.CustomerUserDetails;
import com.freshmcalc.domain.service.PaymentService;
import com.freshmcalc.dto.PaymentDto;
import com.freshmcalc.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Subscription checkout. Prices come from the database, not the browser.
 */
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /** Step 1 — create a Razorpay order for a plan. */
    @PostMapping("/order")
    public ResponseEntity<PaymentDto.OrderResponse> createOrder(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @Valid @RequestBody PaymentDto.CreateOrderRequest req) {
        return ResponseEntity.ok(paymentService.createOrder(requireUserId(principal), req.planId()));
    }

    /** Step 2 — verify the checkout signature; only then activate the plan. */
    @PostMapping("/verify")
    public ResponseEntity<PaymentDto.PaymentResponse> verifyPayment(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @Valid @RequestBody PaymentDto.VerifyPaymentRequest req) {
        return ResponseEntity.ok(paymentService.verifyAndActivate(requireUserId(principal), req));
    }

    private Long requireUserId(CustomerUserDetails principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        return principal.getUser().getId();
    }
}
