package com.freshmcalc.dto;

import jakarta.validation.constraints.NotNull;
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
        Long routeId,
        @NotNull String containerType,
        @NotNull java.math.BigDecimal amount,
        String currency,
        String source,
        Instant effectiveDate,
        Instant expiryDate
    ) {}
}
