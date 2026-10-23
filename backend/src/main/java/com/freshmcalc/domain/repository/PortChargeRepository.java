package com.freshmcalc.domain.repository;

import com.freshmcalc.domain.entity.PortCharge;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PortChargeRepository extends JpaRepository<PortCharge, Long> {
    List<PortCharge> findByPort_IdIn(Collection<Long> portIds);

    @Query(value = """
        SELECT EXISTS (
            SELECT 1 FROM port_charges
            WHERE port_id = :portId
              AND direction = :direction
              AND charge_category = :chargeCategory
              AND description = :description
              AND currency = :currency
              AND charging_basis = :chargingBasis
              AND shipping_mode = :shippingMode
              AND COALESCE(container_type, '') = COALESCE(:containerType, '')
              AND COALESCE(product_name, '') = COALESCE(:productName, '')
              AND effective_from = :effectiveFrom
              AND COALESCE(source, '') = COALESCE(:source, '')
              AND (:excludeId IS NULL OR id <> :excludeId)
        )
        """, nativeQuery = true)
    boolean existsDuplicateRecord(
        @Param("portId") Long portId,
        @Param("direction") String direction,
        @Param("chargeCategory") String chargeCategory,
        @Param("description") String description,
        @Param("currency") String currency,
        @Param("chargingBasis") String chargingBasis,
        @Param("shippingMode") String shippingMode,
        @Param("containerType") String containerType,
        @Param("productName") String productName,
        @Param("effectiveFrom") Instant effectiveFrom,
        @Param("source") String source,
        @Param("excludeId") Long excludeId
    );
}
