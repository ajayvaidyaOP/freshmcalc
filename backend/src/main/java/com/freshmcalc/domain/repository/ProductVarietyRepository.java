package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.ProductVariety;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVarietyRepository extends JpaRepository<ProductVariety, Long> {
}
