package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Calculation;
import com.freshmcalc.domain.entity.CalculationItem;
import com.freshmcalc.domain.entity.CalculationStatus;
import com.freshmcalc.domain.entity.CostGroup;
import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.repository.CalculationRepository;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.dto.CalculationDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Export cost calculation engine. Backend source of truth. All monetary math uses BigDecimal.
 * Historical snapshots are immutable — values never silently change when rates/expenses change.
 */
@Service
@Transactional
public class CalculationService {

    private static final String FORMULA_VERSION = "1.0";
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final CalculationRepository calculationRepository;
    private final UserRepository userRepository;

    public CalculationService(CalculationRepository calculationRepository, UserRepository userRepository) {
        this.calculationRepository = calculationRepository;
        this.userRepository = userRepository;
    }

    public CalculationDto.CalculationResponse createCalculation(Long userId,
                                                                CalculationDto.CalculationRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Calculation calc = new Calculation();
        calc.setUser(user);
        calc.setReferenceNumber("FM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        calc.setProduct(req.product());
        calc.setVariety(req.variety());
        calc.setGrade(req.grade());
        calc.setPackingCentre(req.packingCentre());
        calc.setOriginCity(req.originCity());
        calc.setOriginPort(req.originPort());
        calc.setDestinationCountry(req.destinationCountry());
        calc.setDestinationCity(req.destinationCity());
        calc.setDestinationPort(req.destinationPort());
        calc.setContainerType(req.containerType());
        calc.setNumberOfBoxes(req.numberOfBoxes());
        calc.setNetWeightKg(req.netWeightKg());
        calc.setGrossWeightKg(req.grossWeightKg());
        calc.setProductCostPerUnit(req.productCostPerUnit());
        calc.setProductCostUnit(req.productCostUnit());
        calc.setExpectedDubaiSellingPricePerUnit(req.expectedDubaiSellingPricePerUnit());
        calc.setExpectedDubaiSellingPriceUnit(req.expectedDubaiSellingPriceUnit());
        calc.setConversionRateInrToAed(req.conversionRateInrToAed());
        calc.setConversionSource(req.conversionSource());
        calc.setFormulaVersion(FORMULA_VERSION);
        calc.setAssumptions(req.assumptions());
        calc.setStatus(CalculationStatus.DRAFT);

        BigDecimal conversion = req.conversionRateInrToAed() != null ? req.conversionRateInrToAed() : BigDecimal.ONE;

        // The goods themselves are always part of the cost sheet. Older clients
        // (and API callers) may send only expense items, so add the purchase
        // line from the unit cost instead of silently landing at zero cost.
        List<CalculationDto.CalculationItemRequest> itemRequests =
            new ArrayList<>(req.items() != null ? req.items() : List.of());
        boolean hasPurchaseItem = itemRequests.stream()
            .anyMatch(i -> "PURCHASE".equalsIgnoreCase(i.costGroup()));
        if (!hasPurchaseItem) {
            BigDecimal goodsCost = computePurchaseAmount(
                req.productCostPerUnit(), req.productCostUnit(), req.numberOfBoxes(), req.netWeightKg());
            if (goodsCost.compareTo(BigDecimal.ZERO) > 0) {
                itemRequests.add(0, new CalculationDto.CalculationItemRequest(
                    "PRODUCT", "Product purchase", goodsCost, "INR", "PURCHASE"));
            }
        }

        BigDecimal totalPurchase = BigDecimal.ZERO;
        BigDecimal totalOrigin = BigDecimal.ZERO;
        BigDecimal totalFreight = BigDecimal.ZERO;
        BigDecimal totalDestination = BigDecimal.ZERO;
        BigDecimal totalCommissionTax = BigDecimal.ZERO;

        for (CalculationDto.CalculationItemRequest itemReq : itemRequests) {
            BigDecimal amount = itemReq.amount() != null ? itemReq.amount() : BigDecimal.ZERO;
            BigDecimal amountAed = convert(amount, itemReq.currency(), conversion);
            CostGroup group = parseGroup(itemReq.costGroup());
            // Group totals are kept in INR so the final conversion happens once.
            BigDecimal amountInr = toInr(amount, itemReq.currency(), conversion);

            CalculationItem item = new CalculationItem();
            item.setCalculation(calc);
            item.setExpenseCategory(itemReq.expenseCategory());
            item.setExpenseName(itemReq.expenseName());
            item.setAmount(amount);
            item.setCurrency(itemReq.currency());
            item.setAmountAed(amountAed);
            item.setCostGroup(group);
            item.setSourceNote(itemReq.sourceNote());
            calc.getItems().add(item);

            switch (group) {
                case PURCHASE -> totalPurchase = totalPurchase.add(amountInr);
                case ORIGIN -> totalOrigin = totalOrigin.add(amountInr);
                case FREIGHT -> totalFreight = totalFreight.add(amountInr);
                case DESTINATION -> totalDestination = totalDestination.add(amountInr);
                case COMMISSION_TAX -> totalCommissionTax = totalCommissionTax.add(amountInr);
            }
        }

        Calculation saved = calculationRepository.save(calc);

        BigDecimal totalShipment = totalPurchase.add(totalOrigin).add(totalFreight).add(totalDestination)
            .add(totalCommissionTax);
        BigDecimal totalLandedAed = convert(totalShipment, "INR", conversion);

        BigDecimal costPerBox = BigDecimal.ZERO;
        BigDecimal costPerKg = BigDecimal.ZERO;
        BigDecimal costPerTonne = BigDecimal.ZERO;
        if (req.numberOfBoxes() != null && req.numberOfBoxes() > 0) {
            costPerBox = totalLandedAed.divide(BigDecimal.valueOf(req.numberOfBoxes()), 4, RoundingMode.HALF_UP);
        }
        if (req.netWeightKg() != null && req.netWeightKg().compareTo(BigDecimal.ZERO) > 0) {
            costPerKg = totalLandedAed.divide(req.netWeightKg(), 4, RoundingMode.HALF_UP);
        }
        if (req.netWeightKg() != null && req.netWeightKg().compareTo(BigDecimal.ZERO) > 0) {
            costPerTonne = totalLandedAed.divide(req.netWeightKg().divide(new BigDecimal("1000"), 4, RoundingMode.HALF_UP), 4, RoundingMode.HALF_UP);
        }

        BigDecimal expectedRevenue = computeExpectedRevenue(
            req.expectedDubaiSellingPricePerUnit(), req.expectedDubaiSellingPriceUnit(),
            req.numberOfBoxes(), req.netWeightKg());
        BigDecimal grossProfit = expectedRevenue.subtract(totalLandedAed);
        BigDecimal profitPerBox = BigDecimal.ZERO;
        if (req.numberOfBoxes() != null && req.numberOfBoxes() > 0) {
            profitPerBox = grossProfit.divide(BigDecimal.valueOf(req.numberOfBoxes()), 4, RoundingMode.HALF_UP);
        }
        BigDecimal profitMargin = BigDecimal.ZERO;
        if (expectedRevenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = grossProfit.divide(expectedRevenue, 6, RoundingMode.HALF_UP).multiply(HUNDRED);
        }

        return toResponse(saved, totalPurchase, totalOrigin, totalFreight, totalDestination,
            totalCommissionTax, totalShipment, totalLandedAed, costPerBox, costPerKg, costPerTonne,
            expectedRevenue, grossProfit, profitPerBox, profitMargin);
    }

    public CalculationDto.CalculationResponse getCalculation(Long id, Long userId) {
        Calculation calc = calculationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Calculation not found: " + id));
        if (!calc.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this calculation.");
        }
        return buildResponse(calc);
    }

    public List<CalculationDto.CalculationResponse> listCalculations(Long userId) {
        return calculationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(this::buildResponse).toList();
    }

    @Transactional(readOnly = true)
    private CalculationDto.CalculationResponse buildResponse(Calculation calc) {
        BigDecimal totalPurchase = BigDecimal.ZERO;
        BigDecimal totalOrigin = BigDecimal.ZERO;
        BigDecimal totalFreight = BigDecimal.ZERO;
        BigDecimal totalDestination = BigDecimal.ZERO;
        BigDecimal totalCommissionTax = BigDecimal.ZERO;
        BigDecimal conversion = calc.getConversionRateInrToAed() != null ? calc.getConversionRateInrToAed() : BigDecimal.ONE;
        boolean hasPurchaseItem = false;
        for (CalculationItem item : calc.getItems()) {
            BigDecimal amountInr = toInr(item.getAmount(), item.getCurrency(), conversion);
            switch (item.getCostGroup()) {
                case PURCHASE -> { totalPurchase = totalPurchase.add(amountInr); hasPurchaseItem = true; }
                case ORIGIN -> totalOrigin = totalOrigin.add(amountInr);
                case FREIGHT -> totalFreight = totalFreight.add(amountInr);
                case DESTINATION -> totalDestination = totalDestination.add(amountInr);
                case COMMISSION_TAX -> totalCommissionTax = totalCommissionTax.add(amountInr);
            }
        }
        // Legacy rows saved before expense items existed: derive the purchase
        // cost from the stored unit cost so their landed cost is not zero.
        if (!hasPurchaseItem) {
            totalPurchase = totalPurchase.add(computePurchaseAmount(
                calc.getProductCostPerUnit(), calc.getProductCostUnit(),
                calc.getNumberOfBoxes(), calc.getNetWeightKg()));
        }
        BigDecimal totalShipment = totalPurchase.add(totalOrigin).add(totalFreight).add(totalDestination)
            .add(totalCommissionTax);
        BigDecimal totalLandedAed = convert(totalShipment, "INR", conversion);

        BigDecimal costPerBox = BigDecimal.ZERO;
        BigDecimal costPerKg = BigDecimal.ZERO;
        BigDecimal costPerTonne = BigDecimal.ZERO;
        if (calc.getNumberOfBoxes() != null && calc.getNumberOfBoxes() > 0) {
            costPerBox = totalLandedAed.divide(BigDecimal.valueOf(calc.getNumberOfBoxes()), 4, RoundingMode.HALF_UP);
        }
        if (calc.getNetWeightKg() != null && calc.getNetWeightKg().compareTo(BigDecimal.ZERO) > 0) {
            costPerKg = totalLandedAed.divide(calc.getNetWeightKg(), 4, RoundingMode.HALF_UP);
        }
        if (calc.getNetWeightKg() != null && calc.getNetWeightKg().compareTo(BigDecimal.ZERO) > 0) {
            costPerTonne = totalLandedAed.divide(
                calc.getNetWeightKg().divide(new BigDecimal("1000"), 4, RoundingMode.HALF_UP),
                4, RoundingMode.HALF_UP);
        }

        BigDecimal expectedRevenue = computeExpectedRevenue(
            calc.getExpectedDubaiSellingPricePerUnit(), calc.getExpectedDubaiSellingPriceUnit(),
            calc.getNumberOfBoxes(), calc.getNetWeightKg());
        BigDecimal grossProfit = expectedRevenue.subtract(totalLandedAed);
        BigDecimal profitPerBox = BigDecimal.ZERO;
        if (calc.getNumberOfBoxes() != null && calc.getNumberOfBoxes() > 0) {
            profitPerBox = grossProfit.divide(BigDecimal.valueOf(calc.getNumberOfBoxes()), 4, RoundingMode.HALF_UP);
        }
        BigDecimal profitMargin = BigDecimal.ZERO;
        if (expectedRevenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = grossProfit.divide(expectedRevenue, 6, RoundingMode.HALF_UP).multiply(HUNDRED);
        }

        return toResponse(calc, totalPurchase, totalOrigin, totalFreight, totalDestination,
            totalCommissionTax, totalShipment, totalLandedAed, costPerBox, costPerKg, costPerTonne,
            expectedRevenue, grossProfit, profitPerBox, profitMargin);
    }

    public void deleteCalculation(Long id, Long userId) {
        Calculation calc = calculationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Calculation not found: " + id));
        if (!calc.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this calculation.");
        }
        calculationRepository.delete(calc);
    }

    /**
     * Revenue = Dubai price × quantity. Supports both per-box and per-kg price
     * units so a per-kg quote is not multiplied by the box count.
     */
    private BigDecimal computeExpectedRevenue(BigDecimal price, String unit, Integer boxes, BigDecimal netWeightKg) {
        if (price == null) return BigDecimal.ZERO;
        if ("per kg".equalsIgnoreCase(unit)) {
            return netWeightKg != null ? price.multiply(netWeightKg) : BigDecimal.ZERO;
        }
        return boxes != null ? price.multiply(BigDecimal.valueOf(boxes)) : BigDecimal.ZERO;
    }

    /** Purchase cost of the goods itself, in INR. */
    private BigDecimal computePurchaseAmount(BigDecimal costPerUnit, String unit, Integer boxes, BigDecimal netWeightKg) {
        if (costPerUnit == null) return BigDecimal.ZERO;
        if ("per kg".equalsIgnoreCase(unit)) {
            return netWeightKg != null ? costPerUnit.multiply(netWeightKg) : BigDecimal.ZERO;
        }
        return boxes != null ? costPerUnit.multiply(BigDecimal.valueOf(boxes)) : BigDecimal.ZERO;
    }

    private BigDecimal convert(BigDecimal amount, String currency, BigDecimal rate) {
        if (amount == null) return BigDecimal.ZERO;
        if ("AED".equalsIgnoreCase(currency)) return amount;
        if (rate == null) rate = BigDecimal.ONE;
        return amount.multiply(rate).setScale(4, RoundingMode.HALF_UP);
    }

    /** Convert a line amount to INR (the cost sheet's canonical currency). */
    private BigDecimal toInr(BigDecimal amount, String currency, BigDecimal rate) {
        if (amount == null) return BigDecimal.ZERO;
        if ("AED".equalsIgnoreCase(currency)) {
            if (rate == null || rate.compareTo(BigDecimal.ZERO) == 0) return amount;
            return amount.divide(rate, 4, RoundingMode.HALF_UP);
        }
        return amount;
    }

    private CostGroup parseGroup(String group) {
        if (group == null) return CostGroup.ORIGIN;
        try {
            return CostGroup.valueOf(group);
        } catch (IllegalArgumentException e) {
            return CostGroup.ORIGIN;
        }
    }

    private CalculationDto.CalculationResponse toResponse(Calculation c,
                                                          BigDecimal totalPurchase, BigDecimal totalOrigin,
                                                          BigDecimal totalFreight, BigDecimal totalDestination,
                                                          BigDecimal totalCommissionTax, BigDecimal totalShipment,
                                                          BigDecimal totalLandedAed, BigDecimal costPerBox,
                                                          BigDecimal costPerKg, BigDecimal costPerTonne,
                                                          BigDecimal expectedRevenue, BigDecimal grossProfit,
                                                          BigDecimal profitPerBox, BigDecimal profitMargin) {
        List<CalculationDto.CalculationItemResponse> items = c.getItems().stream()
            .map(i -> new CalculationDto.CalculationItemResponse(
                i.getId(), i.getExpenseCategory(), i.getExpenseName(), i.getAmount(), i.getCurrency(),
                i.getAmountAed(), i.getCostGroup() != null ? i.getCostGroup().name() : null, i.getSourceNote()))
            .toList();
        return new CalculationDto.CalculationResponse(
            c.getId(), c.getReferenceNumber(), c.getProduct(), c.getVariety(), c.getGrade(),
            c.getPackingCentre(), c.getOriginCity(), c.getOriginPort(), c.getDestinationCountry(),
            c.getDestinationCity(), c.getDestinationPort(), c.getContainerType(), c.getNumberOfBoxes(),
            c.getNetWeightKg(), c.getGrossWeightKg(), c.getProductCostPerUnit(), c.getProductCostUnit(),
            c.getExpectedDubaiSellingPricePerUnit(), c.getExpectedDubaiSellingPriceUnit(),
            c.getConversionRateInrToAed(), c.getConversionSource(), c.getFormulaVersion(), c.getAssumptions(),
            c.getStatus() != null ? c.getStatus().name() : null, items,
            totalPurchase, totalOrigin, totalFreight, totalDestination, totalCommissionTax,
            totalShipment, totalLandedAed, costPerBox, costPerKg, costPerTonne,
            expectedRevenue, grossProfit, profitPerBox, profitMargin,
            c.getCreatedAt() != null ? c.getCreatedAt().toString() : null
        );
    }
}
