package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.MarketRateHistory;
import com.freshmcalc.domain.entity.RateStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketRateHistoryRepository extends JpaRepository<MarketRateHistory, Long> {
    List<MarketRateHistory> findTop1000ByStatusOrderByCreatedAtDesc(RateStatus status);
}
