package com.freshmcalc.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.Instant;

public class RateDto {

    public record MarketRateResponse(
        Long id,
        Long productVarietyId,
        String productName,
        String variety,
        String grade,
        String marketName,
        String country,
        String city,
        BigDecimal priceAmount,
        String currency,
        String pricingUnit,
        String packagingDetails,
        String originCountry,
        Instant effectiveDateTime,
        Instant lastUpdated,
        String dataSource,
        String sourceReference,
        Boolean automaticallyFetched,
        String status,
        String updatedBy
    ) {}

    public record CreateMarketRateRequest(
        @NotNull Long productVarietyId,
        String marketName,
        String country,
        String city,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal priceAmount,
        String currency,
        @NotBlank String pricingUnit,
        String packagingDetails,
        String originCountry,
        Instant effectiveDateTime,
        String dataSource,
        String sourceReference
    ) {}

    public record UpdateMarketRateRequest(
        String marketName,
        String country,
        String city,
        @DecimalMin(value = "0", inclusive = false) BigDecimal priceAmount,
        String currency,
        String pricingUnit,
        String packagingDetails,
        String originCountry,
        Instant effectiveDateTime,
        String dataSource,
        String sourceReference,
        String status,
        String updatedBy
    ) {}

    public record PublishRateRequest(
        @Pattern(regexp = "DRAFT|PUBLISHED|STALE") String status,
        String updatedBy
    ) {}
}
