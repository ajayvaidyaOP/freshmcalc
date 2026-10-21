package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.MarketRate;
import com.freshmcalc.domain.entity.RateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketRateRepository extends JpaRepository<MarketRate, Long> {
}
