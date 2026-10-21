package com.freshmcalc.controller;

import com.freshmcalc.domain.service.SubscriptionService;
import com.freshmcalc.dto.SubscriptionDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/subscription-plans")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionDto.SubscriptionPlanResponse>> listPlans() {
        return ResponseEntity.ok(subscriptionService.listPlans());
    }

    @PostMapping("/subscribe")
    public ResponseEntity<SubscriptionDto.SubscriptionResponse> subscribe(
            @RequestHeader(name = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody SubscriptionDto.CreateSubscriptionRequest req) {
        return ResponseEntity.ok(subscriptionService.subscribe(userId, req));
    }

    @GetMapping("/subscription")
    public ResponseEntity<SubscriptionDto.SubscriptionResponse> getSubscription(
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(subscriptionService.getActiveSubscription(userId));
    }
}
