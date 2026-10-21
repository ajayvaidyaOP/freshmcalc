package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.Subscription;
import com.freshmcalc.domain.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserIdAndStatusOrderByCurrentPeriodEndDesc(Long userId, SubscriptionStatus status);
}
