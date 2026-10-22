package com.freshmcalc.controller;

import com.freshmcalc.config.security.CustomerUserDetails;
import com.freshmcalc.domain.service.AccessControlService;
import com.freshmcalc.domain.service.MarketRateService;
import com.freshmcalc.dto.RateDto;
import com.freshmcalc.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rates")
public class MarketRateController {

    private final MarketRateService marketRateService;
    private final AccessControlService accessControlService;

    public MarketRateController(MarketRateService marketRateService,
                                AccessControlService accessControlService) {
        this.marketRateService = marketRateService;
        this.accessControlService = accessControlService;
    }

    @GetMapping
    public ResponseEntity<List<RateDto.MarketRateResponse>> listPublishedRates(
            @AuthenticationPrincipal CustomerUserDetails principal) {
        accessControlService.require(requireUser(principal), AccessControlService.Feature.DUBAI_RATES);
        return ResponseEntity.ok(marketRateService.getPublishedRates());
    }

    @GetMapping("/history")
    public ResponseEntity<List<RateDto.MarketRateResponse>> listRateHistory(
            @AuthenticationPrincipal CustomerUserDetails principal) {
        accessControlService.require(requireUser(principal), AccessControlService.Feature.DUBAI_RATES);
        return ResponseEntity.ok(marketRateService.getRateHistory());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RateDto.MarketRateResponse>> listAllRates() {
        return ResponseEntity.ok(marketRateService.getAllRates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RateDto.MarketRateResponse> getRate(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @PathVariable Long id) {
        accessControlService.require(requireUser(principal), AccessControlService.Feature.DUBAI_RATES);
        return ResponseEntity.ok(marketRateService.getRate(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RateDto.MarketRateResponse> createRate(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @Valid @RequestBody RateDto.CreateMarketRateRequest req) {
        return ResponseEntity.ok(marketRateService.createRate(req, requireUser(principal).getEmail()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RateDto.MarketRateResponse> updateRate(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomerUserDetails principal,
            @Valid @RequestBody RateDto.UpdateMarketRateRequest req) {
        return ResponseEntity.ok(marketRateService.updateRate(id, req, requireUser(principal).getEmail()));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RateDto.MarketRateResponse> publishRate(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomerUserDetails principal,
            @Valid @RequestBody RateDto.PublishRateRequest req) {
        return ResponseEntity.ok(marketRateService.publishRate(id, req, requireUser(principal).getEmail()));
    }

    private com.freshmcalc.domain.entity.User requireUser(CustomerUserDetails principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        return principal.getUser();
    }

    @PostMapping("/{id}/stale")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markStale(@PathVariable Long id,
                                          @AuthenticationPrincipal CustomerUserDetails principal) {
        marketRateService.markStale(id, requireUser(principal).getEmail());
        return ResponseEntity.ok().build();
    }
}
