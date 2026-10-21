package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.ExpenseTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseTemplateRepository extends JpaRepository<ExpenseTemplate, Long> {
}
