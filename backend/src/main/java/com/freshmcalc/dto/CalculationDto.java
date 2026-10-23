package com.freshmcalc.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class CalculationDto {

    public record CalculationItemRequest(
        String expenseCategory,
        String expenseName,
        @NotNull @DecimalMin("0") BigDecimal amount,
        @NotBlank @Pattern(regexp = "INR|AED", flags = Pattern.Flag.CASE_INSENSITIVE) String currency,
        @NotBlank @Pattern(regexp = "PURCHASE|ORIGIN|FREIGHT|DESTINATION|COMMISSION_TAX", flags = Pattern.Flag.CASE_INSENSITIVE) String costGroup,
        String sourceNote
    ) {
        public CalculationItemRequest(String expenseCategory, String expenseName, BigDecimal amount, String currency, String costGroup) {
            this(expenseCategory, expenseName, amount, currency, costGroup, null);
        }
    }

    public record CalculationItemResponse(
        Long id,
        String expenseCategory,
        String expenseName,
        BigDecimal amount,
        String currency,
        BigDecimal amountAed,
        String costGroup,
        String sourceNote
    ) {}

    public record CalculationRequest(
        @NotBlank String product,
        String variety,
        String grade,
        String packingCentre,
        @NotBlank String originCity,
        @NotBlank String originPort,
        @NotBlank String destinationCountry,
        @NotBlank String destinationCity,
        @NotBlank String destinationPort,
        @NotBlank String containerType,
        @NotNull @Min(1) Integer numberOfBoxes,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal netWeightKg,
        @DecimalMin("0") BigDecimal grossWeightKg,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal productCostPerUnit,
        @NotBlank @Pattern(regexp = "per box|per kg", flags = Pattern.Flag.CASE_INSENSITIVE) String productCostUnit,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal expectedDubaiSellingPricePerUnit,
        @NotBlank @Pattern(regexp = "per box|per kg", flags = Pattern.Flag.CASE_INSENSITIVE) String expectedDubaiSellingPriceUnit,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal conversionRateInrToAed,
        String conversionSource,
        String assumptions,
        @Valid List<CalculationItemRequest> items
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
