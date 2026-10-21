package com.freshmcalc.controller;

import com.freshmcalc.domain.service.MarketRateService;
import com.freshmcalc.dto.RateDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rates")
public class MarketRateController {

    private final MarketRateService marketRateService;

    public MarketRateController(MarketRateService marketRateService) {
        this.marketRateService = marketRateService;
    }

    @GetMapping
    public ResponseEntity<List<RateDto.MarketRateResponse>> listPublishedRates() {
        return ResponseEntity.ok(marketRateService.getPublishedRates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RateDto.MarketRateResponse> getRate(@PathVariable Long id) {
        return ResponseEntity.ok(marketRateService.getRate(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RateDto.MarketRateResponse> createRate(
            @RequestHeader(name = "X-User-Email", required = false) String updatedBy,
            @Valid @RequestBody RateDto.CreateMarketRateRequest req) {
        return ResponseEntity.ok(marketRateService.createRate(req, updatedBy));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RateDto.MarketRateResponse> updateRate(
            @PathVariable Long id,
            @RequestHeader(name = "X-User-Email", required = false) String updatedBy,
            @Valid @RequestBody RateDto.UpdateMarketRateRequest req) {
        return ResponseEntity.ok(marketRateService.updateRate(id, req, updatedBy));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RateDto.MarketRateResponse> publishRate(
            @PathVariable Long id,
            @RequestHeader(name = "X-User-Email", required = false) String updatedBy,
            @Valid @RequestBody RateDto.PublishRateRequest req) {
        return ResponseEntity.ok(marketRateService.publishRate(id, req, updatedBy));
    }

    @PostMapping("/{id}/stale")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markStale(@PathVariable Long id,
                                          @RequestHeader(name = "X-User-Email", required = false) String updatedBy) {
        marketRateService.markStale(id, updatedBy);
        return ResponseEntity.ok().build();
    }
}
