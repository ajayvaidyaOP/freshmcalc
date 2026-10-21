package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.MarketRate;
import com.freshmcalc.domain.entity.MarketRateHistory;
import com.freshmcalc.domain.entity.ProductVariety;
import com.freshmcalc.domain.entity.RateStatus;
import com.freshmcalc.domain.repository.MarketRateHistoryRepository;
import com.freshmcalc.domain.repository.MarketRateRepository;
import com.freshmcalc.domain.repository.ProductVarietyRepository;
import com.freshmcalc.dto.RateDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Dubai market-rate management. Rates are Dubai, UAE (AED) — never Indian domestic prices.
 */
@Service
@Transactional
public class MarketRateService {

    private final MarketRateRepository marketRateRepository;
    private final MarketRateHistoryRepository historyRepository;
    private final ProductVarietyRepository varietyRepository;

    public MarketRateService(MarketRateRepository marketRateRepository,
                             MarketRateHistoryRepository historyRepository,
                             ProductVarietyRepository varietyRepository) {
        this.marketRateRepository = marketRateRepository;
        this.historyRepository = historyRepository;
        this.varietyRepository = varietyRepository;
    }

    public List<RateDto.MarketRateResponse> getPublishedRates() {
        return marketRateRepository.findAll().stream()
            .filter(r -> RateStatus.PUBLISHED.equals(r.getStatus()))
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public RateDto.MarketRateResponse getRate(Long id) {
        MarketRate rate = marketRateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Market rate not found: " + id));
        return toResponse(rate);
    }

    public RateDto.MarketRateResponse createRate(RateDto.CreateMarketRateRequest req, String updatedBy) {
        ProductVariety variety = varietyRepository.findById(req.productVarietyId())
            .orElseThrow(() -> new ResourceNotFoundException("Product variety not found: " + req.productVarietyId()));

        MarketRate rate = new MarketRate();
        rate.setProductVariety(variety);
        rate.setMarketName(req.marketName() != null ? req.marketName() : "Dubai, UAE");
        rate.setCountry(req.country() != null ? req.country() : "UAE");
        rate.setCity(req.city() != null ? req.city() : "Dubai");
        rate.setPriceAmount(req.priceAmount());
        rate.setCurrency(req.currency() != null ? req.currency() : "AED");
        rate.setPricingUnit(req.pricingUnit());
        rate.setPackagingDetails(req.packagingDetails());
        rate.setOriginCountry(req.originCountry());
        rate.setEffectiveDateTime(req.effectiveDateTime() != null ? req.effectiveDateTime() : Instant.now());
        rate.setLastUpdated(Instant.now());
        rate.setDataSource(req.dataSource() != null ? req.dataSource() : "ADMIN");
        rate.setSourceReference(req.sourceReference());
        rate.setAutomaticallyFetched(false); // admin-entered; never labeled as real-time auto-fetched
        rate.setStatus(RateStatus.DRAFT);
        rate.setUpdatedBy(updatedBy);

        MarketRate saved = marketRateRepository.save(rate);
        return toResponse(saved);
    }

    public RateDto.MarketRateResponse updateRate(Long id, RateDto.UpdateMarketRateRequest req, String updatedBy) {
        MarketRate rate = marketRateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Market rate not found: " + id));

        // Snapshot history before change
        MarketRateHistory history = new MarketRateHistory();
        history.setMarketRate(rate);
        history.setPriceAmount(rate.getPriceAmount());
        history.setCurrency(rate.getCurrency());
        history.setPricingUnit(rate.getPricingUnit());
        history.setEffectiveDateTime(rate.getEffectiveDateTime());
        history.setStatus(rate.getStatus());
        history.setChangedBy(updatedBy);
        history.setChangeReason("Update by " + updatedBy);
        historyRepository.save(history);

        if (req.marketName() != null) rate.setMarketName(req.marketName());
        if (req.country() != null) rate.setCountry(req.country());
        if (req.city() != null) rate.setCity(req.city());
        if (req.priceAmount() != null) rate.setPriceAmount(req.priceAmount());
        if (req.currency() != null) rate.setCurrency(req.currency());
        if (req.pricingUnit() != null) rate.setPricingUnit(req.pricingUnit());
        if (req.packagingDetails() != null) rate.setPackagingDetails(req.packagingDetails());
        if (req.originCountry() != null) rate.setOriginCountry(req.originCountry());
        if (req.effectiveDateTime() != null) rate.setEffectiveDateTime(req.effectiveDateTime());
        if (req.dataSource() != null) rate.setDataSource(req.dataSource());
        if (req.sourceReference() != null) rate.setSourceReference(req.sourceReference());
        rate.setLastUpdated(Instant.now());
        rate.setUpdatedBy(updatedBy);

        return toResponse(marketRateRepository.save(rate));
    }

    public RateDto.MarketRateResponse publishRate(Long id, RateDto.PublishRateRequest req, String updatedBy) {
        MarketRate rate = marketRateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Market rate not found: " + id));
        rate.setStatus(req.status() != null ? RateStatus.valueOf(req.status()) : RateStatus.PUBLISHED);
        rate.setLastUpdated(Instant.now());
        rate.setUpdatedBy(updatedBy);
        return toResponse(marketRateRepository.save(rate));
    }

    public void markStale(Long id, String updatedBy) {
        MarketRate rate = marketRateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Market rate not found: " + id));
        rate.setStatus(RateStatus.STALE);
        rate.setLastUpdated(Instant.now());
        rate.setUpdatedBy(updatedBy);
        marketRateRepository.save(rate);
    }

    private RateDto.MarketRateResponse toResponse(MarketRate r) {
        ProductVariety v = r.getProductVariety();
        return new RateDto.MarketRateResponse(
            r.getId(),
            v != null ? v.getId() : null,
            v != null ? v.getProduct().getName() : null,
            v != null ? v.getVariety() : null,
            v != null ? v.getGrade() : null,
            r.getMarketName(),
            r.getCountry(),
            r.getCity(),
            r.getPriceAmount(),
            r.getCurrency(),
            r.getPricingUnit(),
            r.getPackagingDetails(),
            r.getOriginCountry(),
            r.getEffectiveDateTime(),
            r.getLastUpdated(),
            r.getDataSource(),
            r.getSourceReference(),
            r.getAutomaticallyFetched(),
            r.getStatus() != null ? r.getStatus().name() : null,
            r.getUpdatedBy()
        );
    }
}
