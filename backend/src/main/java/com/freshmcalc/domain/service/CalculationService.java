package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Calculation;
import com.freshmcalc.domain.entity.CalculationItem;
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
        calc.setStatus(calc.getStatus());

        BigDecimal conversion = req.conversionRateInrToAed() != null ? req.conversionRateInrToAed() : BigDecimal.ONE;

        BigDecimal totalPurchase = BigDecimal.ZERO;
        BigDecimal totalOrigin = BigDecimal.ZERO;
        BigDecimal totalFreight = BigDecimal.ZERO;
        BigDecimal totalDestination = BigDecimal.ZERO;
        BigDecimal totalCommissionTax = BigDecimal.ZERO;

        for (CalculationDto.CalculationItemRequest itemReq : (req.items() != null ? req.items() : List.of())) {
            BigDecimal amount = itemReq.amount();
            BigDecimal amountAed = convert(amount, itemReq.currency(), conversion);
            CostGroup group = parseGroup(itemReq.costGroup());

            CalculationItem item = new CalculationItem();
            item.setCalculation(calc);
            item.setExpenseCategory(itemReq.expenseCategory());
            item.setExpenseName(itemReq.expenseName());
            item.setAmount(amount);
            item.setCurrency(itemReq.currency());
            item.setAmountAed(amountAed);
            item.setCostGroup(group);
            calc.getItems().add(item);

            switch (group) {
                case PURCHASE -> totalPurchase = totalPurchase.add(amount);
                case ORIGIN -> totalOrigin = totalOrigin.add(amount);
                case FREIGHT -> totalFreight = totalFreight.add(amount);
                case DESTINATION -> totalDestination = totalDestination.add(amount);
                case COMMISSION_TAX -> totalCommissionTax = totalCommissionTax.add(amount);
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

        BigDecimal expectedRevenue = BigDecimal.ZERO;
        if (req.expectedDubaiSellingPricePerUnit() != null && req.numberOfBoxes() != null) {
            expectedRevenue = req.expectedDubaiSellingPricePerUnit()
                .multiply(BigDecimal.valueOf(req.numberOfBoxes()));
        }
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
        for (CalculationItem item : calc.getItems()) {
            switch (item.getCostGroup()) {
                case PURCHASE -> totalPurchase = totalPurchase.add(item.getAmount());
                case ORIGIN -> totalOrigin = totalOrigin.add(item.getAmount());
                case FREIGHT -> totalFreight = totalFreight.add(item.getAmount());
                case DESTINATION -> totalDestination = totalDestination.add(item.getAmount());
                case COMMISSION_TAX -> totalCommissionTax = totalCommissionTax.add(item.getAmount());
            }
        }
        BigDecimal conversion = calc.getConversionRateInrToAed() != null ? calc.getConversionRateInrToAed() : BigDecimal.ONE;
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

        BigDecimal expectedRevenue = BigDecimal.ZERO;
        if (calc.getExpectedDubaiSellingPricePerUnit() != null && calc.getNumberOfBoxes() != null) {
            expectedRevenue = calc.getExpectedDubaiSellingPricePerUnit()
                .multiply(BigDecimal.valueOf(calc.getNumberOfBoxes()));
        }
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

    private BigDecimal convert(BigDecimal amount, String currency, BigDecimal rate) {
        if (amount == null) return BigDecimal.ZERO;
        if ("AED".equalsIgnoreCase(currency)) return amount;
        if (rate == null) rate = BigDecimal.ONE;
        return amount.multiply(rate).setScale(4, RoundingMode.HALF_UP);
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
                i.getAmountAed(), i.getCostGroup() != null ? i.getCostGroup().name() : null))
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
