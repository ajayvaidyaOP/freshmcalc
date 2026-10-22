package com.freshmcalc.service;

import com.freshmcalc.domain.entity.MarketRate;
import com.freshmcalc.domain.entity.Product;
import com.freshmcalc.domain.entity.ProductVariety;
import com.freshmcalc.domain.entity.RateStatus;
import com.freshmcalc.domain.repository.MarketRateHistoryRepository;
import com.freshmcalc.domain.repository.MarketRateRepository;
import com.freshmcalc.domain.repository.ProductVarietyRepository;
import com.freshmcalc.domain.service.MarketRateService;
import com.freshmcalc.dto.RateDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Dubai market-rate acceptance tests.
 * Business rule: rates are Dubai, UAE (AED) -- never Indian domestic prices.
 */
public class MarketRateServiceTest {

    @Mock private MarketRateRepository marketRateRepository;
    @Mock private MarketRateHistoryRepository historyRepository;
    @Mock private ProductVarietyRepository varietyRepository;
    @InjectMocks private MarketRateService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private ProductVariety variety(String productName, String variety, String grade, String unit) {
        Product product = new Product(); product.setId(1L); product.setName(productName);
        ProductVariety v = new ProductVariety(); v.setId(10L); v.setProduct(product);
        v.setVariety(variety); v.setGrade(grade); v.setDefaultPackagingUnit(unit);
        return v;
    }

    @Test
    void adminPublishesDubaiPomegranateRateInAedPerBox() {
        ProductVariety v = variety("Pomegranate", "Wonderful", "Grade A", "per box");
        when(varietyRepository.findById(10L)).thenReturn(Optional.of(v));
        when(marketRateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RateDto.CreateMarketRateRequest req = new RateDto.CreateMarketRateRequest(
            10L, "Dubai Wholesale Market", "UAE", "Dubai",
            new BigDecimal("120"), "AED", "per box",
            "5 kg carton", "India", Instant.now(), "ADMIN", "ref-001");

        RateDto.MarketRateResponse res = service.createRate(req, "admin@freshmcalc.example");

        assertEquals("Pomegranate", res.productName());
        assertEquals("Dubai Wholesale Market", res.marketName());
        assertEquals("UAE", res.country());
        assertEquals("AED", res.currency());
        assertEquals("per box", res.pricingUnit());
        assertEquals(new BigDecimal("120"), res.priceAmount());
        assertFalse(res.automaticallyFetched()); // admin-entered, not labeled real-time
        assertEquals(RateStatus.DRAFT.name(), res.status());
    }

    @Test
    void adminPublishesDubaiGreenChilliRateInAedPerKg() {
        ProductVariety v = variety("Green chilli", "Teja", "Grade A", "per kg");
        when(varietyRepository.findById(11L)).thenReturn(Optional.of(v));
        when(marketRateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RateDto.CreateMarketRateRequest req = new RateDto.CreateMarketRateRequest(
            11L, "Dubai Wholesale Market", "UAE", "Dubai",
            new BigDecimal("18"), "AED", "per kg",
            "10 kg box", "India", Instant.now(), "ADMIN", "ref-002");

        RateDto.MarketRateResponse res = service.createRate(req, "admin@freshmcalc.example");

        assertEquals("Green chilli", res.productName());
        assertEquals("AED", res.currency());
        assertEquals("per kg", res.pricingUnit());
        assertFalse(res.automaticallyFetched());
    }

    @Test
    void publishedRateIsNotIndianDomesticPrice() {
        ProductVariety v = variety("Pomegranate", "Wonderful", "Grade A", "per box");
        MarketRate rate = new MarketRate();
        rate.setId(1L); rate.setProductVariety(v);
        rate.setCountry("UAE"); rate.setCity("Dubai"); rate.setCurrency("AED");
        rate.setStatus(RateStatus.PUBLISHED);
        when(marketRateRepository.findById(1L)).thenReturn(Optional.of(rate));

        RateDto.MarketRateResponse res = service.getRate(1L);
        assertEquals("UAE", res.country());
        assertEquals("Dubai", res.city());
        assertEquals("AED", res.currency());
        assertNotEquals("INR", res.currency());
    }
}
