package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.Calculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CalculationRepository extends JpaRepository<Calculation, Long>, JpaSpecificationExecutor<Calculation> {
}
