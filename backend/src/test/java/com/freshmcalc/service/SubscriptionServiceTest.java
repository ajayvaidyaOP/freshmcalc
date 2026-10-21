package com.freshmcalc.service;

import com.freshmcalc.domain.entity.Subscription;
import com.freshmcalc.domain.entity.SubscriptionPlan;
import com.freshmcalc.domain.entity.SubscriptionStatus;
import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.repository.SubscriptionPlanRepository;
import com.freshmcalc.domain.repository.SubscriptionRepository;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.domain.service.SubscriptionService;
import com.freshmcalc.dto.SubscriptionDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SubscriptionServiceTest {

    @Mock private SubscriptionPlanRepository planRepository;
    @Mock private SubscriptionRepository subscriptionRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private SubscriptionService service;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void expiredSubscriptionLosesPaidAccess() {
        User user = new User(); user.setId(1L);
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setId(1L); plan.setName("Monthly"); plan.setActive(true);
        plan.setPriceAmount(new BigDecimal("49900")); plan.setCurrency("INR");
        plan.setBillingCycle("MONTHLY");

        Subscription sub = new Subscription();
        sub.setId(1L); sub.setUser(user); sub.setPlan(plan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setCurrentPeriodEnd(Instant.now().minusSeconds(60)); // already expired

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(planRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(subscriptionRepository.findByUserIdAndStatusOrderByCurrentPeriodEndDesc(1L, SubscriptionStatus.ACTIVE))
            .thenReturn(Optional.of(sub));

        boolean active = service.hasActiveSubscription(1L);
        assertFalse(active, "Expired subscription must not grant paid access");
    }
}
