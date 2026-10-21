package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.MarketDataSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketDataSourceRepository extends JpaRepository<MarketDataSource, Long> {
}
