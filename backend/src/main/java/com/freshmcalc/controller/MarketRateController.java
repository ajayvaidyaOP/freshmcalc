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

    private com.freshmcalc.domain.entity.User requireUser(CustomerUserDetails principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        return principal.getUser();
    }

    @PostMapping("/{id}/stale")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markStale(@PathVariable Long id,
                                          @RequestHeader(name = "X-User-Email", required = false) String updatedBy) {
        marketRateService.markStale(id, updatedBy);
        return ResponseEntity.ok().build();
    }
}
