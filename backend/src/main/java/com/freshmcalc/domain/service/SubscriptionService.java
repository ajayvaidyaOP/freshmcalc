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

    /**
     * Activate a plan after a verified payment. Never call this from a public
     * endpoint without a server-side payment verification step.
     */
    public SubscriptionDto.SubscriptionResponse activatePlan(Long userId, Long planId) {
        return activatePlan(userId, planId, null);
    }

    public SubscriptionDto.SubscriptionResponse activatePlan(Long userId, Long planId, Long sourcePaymentId) {
        if (userId == null || planId == null) {
            throw new BadRequestException("User and plan are required to activate a subscription.");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        SubscriptionPlan plan = planRepository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + planId));
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
        sub.setSourcePaymentId(sourcePaymentId);
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
        SubscriptionDto.SubscriptionResponse active = getActiveSubscriptionOrNull(userId);
        if (active == null) {
            throw new ResourceNotFoundException("No active subscription found for user: " + userId);
        }
        return active;
    }

    /**
     * Active, non-expired subscription or null. Used by the app shell so a
     * free account is a normal state rather than an error.
     */
    @Transactional(readOnly = true)
    public SubscriptionDto.SubscriptionResponse getActiveSubscriptionOrNull(Long userId) {
        if (userId == null) return null;
        return subscriptionRepository
            .findByUserIdAndStatusOrderByCurrentPeriodEndDesc(userId, SubscriptionStatus.ACTIVE)
            .filter(sub -> sub.getCurrentPeriodEnd() == null
                || sub.getCurrentPeriodEnd().isAfter(Instant.now()))
            .map(this::toResponse)
            .orElse(null);
    }

    /** Feature flags for the signed-in user, derived from the active plan. */
    @Transactional(readOnly = true)
    public SubscriptionDto.PlanEntitlements getEntitlements(Long userId) {
        if (userId == null) {
            return new SubscriptionDto.PlanEntitlements(false, false, false, false);
        }
        return subscriptionRepository
            .findByUserIdAndStatusOrderByCurrentPeriodEndDesc(userId, SubscriptionStatus.ACTIVE)
            .filter(sub -> sub.getCurrentPeriodEnd() == null
                || sub.getCurrentPeriodEnd().isAfter(Instant.now()))
            .map(sub -> new SubscriptionDto.PlanEntitlements(
                Boolean.TRUE.equals(sub.getPlan().getDubaiRatesAccess()),
                Boolean.TRUE.equals(sub.getPlan().getCalculatorAccess()),
                Boolean.TRUE.equals(sub.getPlan().getPdfExportAccess()),
                Boolean.TRUE.equals(sub.getPlan().getSavedCalculationsAccess())))
            .orElse(new SubscriptionDto.PlanEntitlements(false, false, false, false));
    }

    /** Cancel the current plan (refund, account deletion, manual support action). */
    public void cancelActive(Long userId) {
        if (userId == null) return;
        subscriptionRepository
            .findByUserIdAndStatusOrderByCurrentPeriodEndDesc(userId, SubscriptionStatus.ACTIVE)
            .ifPresent(sub -> {
                sub.setStatus(SubscriptionStatus.CANCELLED);
                sub.setEndedAt(Instant.now());
                subscriptionRepository.save(sub);
            });
    }

    /** Cancel only the active subscription created by the refunded payment. */
    public boolean cancelActiveForPayment(Long paymentId) {
        if (paymentId == null) return false;
        return subscriptionRepository.findBySourcePaymentIdAndStatus(paymentId, SubscriptionStatus.ACTIVE)
            .map(sub -> {
                sub.setStatus(SubscriptionStatus.CANCELLED);
                sub.setEndedAt(Instant.now());
                subscriptionRepository.save(sub);
                return true;
            })
            .orElse(false);
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
