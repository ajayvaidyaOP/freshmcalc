package com.freshmcalc.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class RouteDto {

    public record ShippingRouteResponse(
        Long id,
        Long originPortId,
        String originPortName,
        Long destinationPortId,
        String destinationPortName,
        Integer transitTimeDays,
        String transitTimeSource,
        Boolean transshipmentRequired,
        String transshipmentLegs,
        Boolean operational
    ) {}

    public record CreateShippingRouteRequest(
        @NotNull Long originPortId,
        @NotNull Long destinationPortId,
        @Min(1) Integer transitTimeDays,
        String transitTimeSource,
        Boolean transshipmentRequired,
        String transshipmentLegs,
        Boolean operational
    ) {}

    public record FreightQuoteResponse(
        Long id,
        Long routeId,
        String containerType,
        java.math.BigDecimal amount,
        String currency,
        String source,
        Instant effectiveDate,
        Instant expiryDate
    ) {}

    public record CreateFreightQuoteRequest(
        @NotNull Long routeId,
        @NotBlank @Size(max = 50) String containerType,
        @NotNull @DecimalMin(value = "0", inclusive = false) java.math.BigDecimal amount,
        @NotBlank @Size(max = 10) String currency,
        @Size(max = 255) String source,
        Instant effectiveDate,
        Instant expiryDate
    ) {}
}
