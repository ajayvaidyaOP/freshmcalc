package com.freshmcalc.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class CalculationDto {

    public record CalculationItemRequest(
        String expenseCategory,
        String expenseName,
        @NotNull @DecimalMin("0") BigDecimal amount,
        String currency,
        String costGroup
    ) {}

    public record CalculationItemResponse(
        Long id,
        String expenseCategory,
        String expenseName,
        BigDecimal amount,
        String currency,
        BigDecimal amountAed,
        String costGroup
    ) {}

    public record CalculationRequest(
        String product,
        String variety,
        String grade,
        String packingCentre,
        String originCity,
        String originPort,
        String destinationCountry,
        String destinationCity,
        String destinationPort,
        String containerType,
        Integer numberOfBoxes,
        BigDecimal netWeightKg,
        BigDecimal grossWeightKg,
        BigDecimal productCostPerUnit,
        String productCostUnit,
        BigDecimal expectedDubaiSellingPricePerUnit,
        String expectedDubaiSellingPriceUnit,
        BigDecimal conversionRateInrToAed,
        String conversionSource,
        String assumptions,
        List<CalculationItemRequest> items
    ) {}

    public record CalculationResponse(
        Long id,
        String referenceNumber,
        String product,
        String variety,
        String grade,
        String packingCentre,
        String originCity,
        String originPort,
        String destinationCountry,
        String destinationCity,
        String destinationPort,
        String containerType,
        Integer numberOfBoxes,
        BigDecimal netWeightKg,
        BigDecimal grossWeightKg,
        BigDecimal productCostPerUnit,
        String productCostUnit,
        BigDecimal expectedDubaiSellingPricePerUnit,
        String expectedDubaiSellingPriceUnit,
        BigDecimal conversionRateInrToAed,
        String conversionSource,
        String formulaVersion,
        String assumptions,
        String status,
        List<CalculationItemResponse> items,
        BigDecimal totalPurchaseInr,
        BigDecimal totalOriginInr,
        BigDecimal totalFreightInr,
        BigDecimal totalDestinationInr,
        BigDecimal totalCommissionTaxInr,
        BigDecimal totalShipmentCostInr,
        BigDecimal totalLandedCostAed,
        BigDecimal costPerBoxAed,
        BigDecimal costPerKgAed,
        BigDecimal costPerTonneAed,
        BigDecimal expectedRevenueAed,
        BigDecimal grossProfitAed,
        BigDecimal profitPerBoxAed,
        BigDecimal profitMarginPercent,
        String createdAt
    ) {}
}
