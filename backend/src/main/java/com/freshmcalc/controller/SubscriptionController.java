package com.freshmcalc.controller;

import com.freshmcalc.config.security.CustomerUserDetails;
import com.freshmcalc.domain.service.SubscriptionService;
import com.freshmcalc.dto.SubscriptionDto;
import com.freshmcalc.exception.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Plan catalogue and the signed-in user's active subscription.
 * New subscriptions are activated only through verified payment
 * (see PaymentController), never by selecting a plan.
 */
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

    @GetMapping("/subscription")
    public ResponseEntity<SubscriptionDto.SubscriptionResponse> getSubscription(
            @AuthenticationPrincipal CustomerUserDetails principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        return ResponseEntity.ok(subscriptionService.getActiveSubscription(principal.getUser().getId()));
    }
}
