package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.SubscriptionPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    /** Active plans in display order — used by the pricing page and billing screen. */
    List<SubscriptionPlan> findByActiveTrueOrderBySortOrderAsc();
}
