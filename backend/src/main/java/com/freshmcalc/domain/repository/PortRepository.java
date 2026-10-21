package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.Port;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortRepository extends JpaRepository<Port, Long> {
}
