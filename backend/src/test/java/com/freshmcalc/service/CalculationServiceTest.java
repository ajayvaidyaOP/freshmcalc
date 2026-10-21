package com.freshmcalc.service;

import com.freshmcalc.domain.entity.Calculation;
import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.repository.CalculationRepository;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.domain.service.CalculationService;
import com.freshmcalc.dto.CalculationDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Independent financial test cases for the export cost calculation engine.
 * All monetary math uses BigDecimal; totals are verified against hand-computed values.
 */
public class CalculationServiceTest {

    @Mock private CalculationRepository calculationRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private CalculationService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void totalsMatchVerifiedFinancialCase() {
        User user = new User();
        user.setId(1L);
        user.setEmail("trader@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(calculationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CalculationDto.CalculationItemRequest productCost = new CalculationDto.CalculationItemRequest(
            "PRODUCT_COST", "Pomegranate purchase", new BigDecimal("500"), "INR", "PURCHASE");
        CalculationDto.CalculationItemRequest packing = new CalculationDto.CalculationItemRequest(
            "PACKING", "Sorting & packing", new BigDecimal("100"), "INR", "ORIGIN");
        CalculationDto.CalculationItemRequest inland = new CalculationDto.CalculationItemRequest(
            "INLAND_TRANSPORT", "Farm to JNPA", new BigDecimal("200"), "INR", "ORIGIN");
        CalculationDto.CalculationItemRequest ocean = new CalculationDto.CalculationItemRequest(
            "OCEAN_FREIGHT", "JNPA to Jebel Ali 20FT", new BigDecimal("3000"), "INR", "FREIGHT");
        CalculationDto.CalculationItemRequest cha = new CalculationDto.CalculationItemRequest(
            "CHA", "Dubai customs clearance", new BigDecimal("500"), "INR", "DESTINATION");
        CalculationDto.CalculationItemRequest commission = new CalculationDto.CalculationItemRequest(
            "COMMISSION", "Sales commission", new BigDecimal("250"), "INR", "COMMISSION_TAX");

        CalculationDto.CalculationRequest req = new CalculationDto.CalculationRequest(
            "Pomegranate", "Wonderful", "Grade A", "Packing Centre A", "Mumbai", "JNPA / Nhava Sheva",
            "UAE", "Dubai", "Jebel Ali Port, Dubai", "20FT", 10,
            new BigDecimal("100"), new BigDecimal("1000"),
            new BigDecimal("50"), "per box",
            new BigDecimal("50"), "per box",
            new BigDecimal("0.05"), "Manual rate 1 INR = 0.05 AED",
            "Test assumptions", List.of(productCost, packing, inland, ocean, cha, commission));

        CalculationDto.CalculationResponse res = service.createCalculation(1L, req);

        // Total INR = 500+100+200+3000+500+250 = 4550
        assertEquals(new BigDecimal("4550"), res.totalPurchaseInr()
            .add(res.totalOriginInr()).add(res.totalFreightInr()).add(res.totalDestinationInr()).add(res.totalCommissionTaxInr()));
        // Total landed AED = 4550 * 0.05 = 227.50
        assertEquals(new BigDecimal("227.5000"), res.totalLandedCostAed());
        // Cost per box = 227.50 / 10 = 22.75
        assertEquals(new BigDecimal("22.7500"), res.costPerBoxAed());
        // Cost per kg = 227.50 / 100 = 2.275
        assertEquals(new BigDecimal("2.2750"), res.costPerKgAed());
        // Cost per tonne = 227.50 / 0.1 = 2275
        assertEquals(new BigDecimal("2275.0000"), res.costPerTonneAed());
        // Expected revenue = 50 AED/box * 10 boxes = 500 AED
        assertEquals(new BigDecimal("500"), res.expectedRevenueAed());
        // Gross profit = 500 - 227.50 = 272.50
        assertEquals(new BigDecimal("272.5000"), res.grossProfitAed());
        // Profit per box = 27.25
        assertEquals(new BigDecimal("27.2500"), res.profitPerBoxAed());
        // Margin = 272.50/500 * 100 = 54.5%
        assertEquals(new BigDecimal("54.500000"), res.profitMarginPercent());
        assertEquals("1.0", res.formulaVersion());
    }

    @Test
    void currencyConversionInrToAedApplied() {
        User user = new User(); user.setId(2L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(calculationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CalculationDto.CalculationItemRequest item = new CalculationDto.CalculationItemRequest(
            "PRODUCT_COST", "Goods", new BigDecimal("1000"), "INR", "PURCHASE");
        CalculationDto.CalculationRequest req = new CalculationDto.CalculationRequest(
            "Green chilli", null, null, null, "Mumbai", "Mundra", "UAE", "Dubai",
            "Jebel Ali Port, Dubai", "20FT", 5, new BigDecimal("50"), new BigDecimal("500"),
            null, null, new BigDecimal("0.05"), "Manual", null, List.of(item));

        CalculationDto.CalculationResponse res = service.createCalculation(2L, req);
        // 1000 INR * 0.05 = 50 AED
        assertEquals(new BigDecimal("50.0000"), res.totalLandedCostAed());
    }

    @Test
    void rejectsAccessToOtherUsersCalculation() {
        Calculation calc = new Calculation();
        User owner = new User(); owner.setId(1L);
        calc.setUser(owner);
        when(calculationRepository.findById(99L)).thenReturn(java.util.Optional.of(calc));
        assertThrows(IllegalArgumentException.class, () -> service.getCalculation(99L, 2L));
    }
}
