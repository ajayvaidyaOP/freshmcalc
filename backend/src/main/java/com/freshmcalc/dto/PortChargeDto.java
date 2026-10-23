package com.freshmcalc.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;

public class PortChargeDto {

    public record PortChargeResponse(
        Long id,
        Long portId,
        String portName,
        String portUnlocode,
        String direction,
        String chargeCategory,
        String description,
        BigDecimal amount,
        String currency,
        String chargingBasis,
        String shippingMode,
        String containerType,
        String productName,
        String conditions,
        Instant effectiveFrom,
        Instant effectiveUntil,
        String source,
        Instant lastVerifiedAt,
        String verificationStatus,
        String currentStatus,
        Boolean active,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy
    ) {}

    public record PortChargeRequest(
        @NotNull Long portId,
        @NotBlank @Pattern(regexp = "ORIGIN|DESTINATION") String direction,
        @NotBlank @Pattern(regexp = "[A-Z0-9_]{2,60}") String chargeCategory,
        @NotBlank @Size(max = 180) String description,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal amount,
        @NotBlank @Pattern(regexp = "[A-Z]{3}") String currency,
        @NotBlank @Pattern(regexp = "PER_SHIPMENT|PER_CONTAINER|PER_KG|PER_TONNE|PER_CARTON") String chargingBasis,
        @NotBlank @Pattern(regexp = "SEA|AIR|ROAD|RAIL|ANY") String shippingMode,
        @Size(max = 30) String containerType,
        @Size(max = 150) String productName,
        @Size(max = 500) String conditions,
        @NotNull Instant effectiveFrom,
        Instant effectiveUntil,
        @Size(max = 255) String source,
        Instant lastVerifiedAt,
        @NotBlank @Pattern(regexp = "VERIFIED|INDICATIVE|UNCONFIRMED") String verificationStatus,
        @NotNull Boolean active
    ) {}
}
