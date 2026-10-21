package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.ShippingRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingRouteRepository extends JpaRepository<ShippingRoute, Long> {
}
