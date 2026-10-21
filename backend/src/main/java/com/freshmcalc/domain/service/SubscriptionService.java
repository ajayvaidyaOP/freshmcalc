package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Subscription;
import com.freshmcalc.domain.entity.SubscriptionStatus;
import com.freshmcalc.domain.entity.SubscriptionPlan;
import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.repository.SubscriptionPlanRepository;
import com.freshmcalc.domain.repository.SubscriptionRepository;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.dto.SubscriptionDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Subscription and entitlement management.
 */
@Service
@Transactional
public class SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(SubscriptionPlanRepository planRepository,
                               SubscriptionRepository subscriptionRepository,
                               UserRepository userRepository) {
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    public List<SubscriptionDto.SubscriptionPlanResponse> listPlans() {
        return planRepository.findByActiveTrueOrderBySortOrderAsc().stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    public SubscriptionDto.SubscriptionResponse subscribe(Long userId, SubscriptionDto.CreateSubscriptionRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        SubscriptionPlan plan = planRepository.findById(req.planId())
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + req.planId()));
        if (!Boolean.TRUE.equals(plan.getActive())) {
            throw new BadRequestException("Plan is not active.");
        }

        // Deactivate any existing active subscription
        subscriptionRepository.findByUserIdAndStatusOrderByCurrentPeriodEndDesc(userId, SubscriptionStatus.ACTIVE)
            .ifPresent(sub -> {
                sub.setStatus(SubscriptionStatus.CANCELLED);
                sub.setEndedAt(Instant.now());
            });

        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setCurrentPeriodStart(Instant.now());
        sub.setCurrentPeriodEnd(Instant.now().plusSeconds(planCycleSeconds(plan)));
        sub.setAmountPaid(plan.getPriceAmount());
        sub.setCurrency(plan.getCurrency());
        return toResponse(subscriptionRepository.save(sub));
    }

    public SubscriptionDto.SubscriptionResponse getActiveSubscription(Long userId) {
        return subscriptionRepository.findByUserIdAndStatusOrderByCurrentPeriodEndDesc(userId, SubscriptionStatus.ACTIVE)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("No active subscription found for user: " + userId));
    }

    public boolean hasActiveSubscription(Long userId) {
        return subscriptionRepository.findByUserIdAndStatusOrderByCurrentPeriodEndDesc(userId, SubscriptionStatus.ACTIVE)
            .map(sub -> sub.getCurrentPeriodEnd() != null && sub.getCurrentPeriodEnd().isAfter(Instant.now()))
            .orElse(false);
    }

    public void expireSubscriptions() {
        List<Subscription> expired = subscriptionRepository.findAll().stream()
            .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE
                && sub.getCurrentPeriodEnd() != null
                && sub.getCurrentPeriodEnd().isBefore(Instant.now()))
            .toList();
        for (Subscription sub : expired) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            sub.setEndedAt(Instant.now());
            subscriptionRepository.save(sub);
        }
    }

    private long planCycleSeconds(SubscriptionPlan plan) {
        String cycle = plan.getBillingCycle();
        if ("MONTHLY".equalsIgnoreCase(cycle)) return 30L * 24 * 3600;
        if ("QUARTERLY".equalsIgnoreCase(cycle)) return 90L * 24 * 3600;
        if ("YEARLY".equalsIgnoreCase(cycle)) return 365L * 24 * 3600;
        return 30L * 24 * 3600;
    }

    private SubscriptionDto.SubscriptionPlanResponse toResponse(SubscriptionPlan p) {
        return new SubscriptionDto.SubscriptionPlanResponse(
            p.getId(), p.getName(), p.getDescription(), p.getPriceAmount(), p.getCurrency(),
            p.getBillingCycle(), p.getRazorpayPlanId(), p.getDubaiRatesAccess(), p.getCalculatorAccess(),
            p.getPdfExportAccess(), p.getSavedCalculationsAccess(), p.getActive(), p.getSortOrder());
    }

    private SubscriptionDto.SubscriptionResponse toResponse(Subscription s) {
        return new SubscriptionDto.SubscriptionResponse(
            s.getId(), s.getPlan().getId(), s.getPlan().getName(), s.getRazorpaySubscriptionId(),
            s.getStatus() != null ? s.getStatus().name() : null, s.getCurrentPeriodStart(),
            s.getCurrentPeriodEnd(), s.getAmountPaid(), s.getCurrency(),
            s.getStatus() == SubscriptionStatus.ACTIVE);
    }
}
