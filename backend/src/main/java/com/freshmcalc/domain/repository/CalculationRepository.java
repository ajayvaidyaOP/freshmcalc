package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.Calculation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CalculationRepository extends JpaRepository<Calculation, Long>, JpaSpecificationExecutor<Calculation> {

    /** Newest first — used by the Saved Cost Sheets screen. */
    List<Calculation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Calculation> findByUserId(Long userId);

    long countByUserId(Long userId);
}
