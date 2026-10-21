package com.freshmcalc.controller;

import com.freshmcalc.domain.service.PaymentService;
import com.freshmcalc.dto.PaymentDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/record")
    public ResponseEntity<PaymentDto.PaymentResponse> recordPayment(
            @RequestHeader(name = "X-User-Id", required = false) Long userId,
            @RequestParam String razorpayOrderId,
            @RequestParam String razorpayPaymentId,
            @RequestParam String amount,
            @RequestParam(required = false, defaultValue = "INR") String currency,
            @RequestParam(required = false) String description) {
        PaymentDto.PaymentResponse res = paymentService.toResponse(
            paymentService.recordPayment(userId, razorpayOrderId, razorpayPaymentId,
                new java.math.BigDecimal(amount), currency, description));
        return ResponseEntity.ok(res);
    }
}
