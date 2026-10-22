package com.freshmcalc.controller;

import com.freshmcalc.config.security.CustomerUserDetails;
import com.freshmcalc.domain.service.AccessControlService;
import com.freshmcalc.domain.service.CalculationService;
import com.freshmcalc.dto.CalculationDto;
import com.freshmcalc.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Export cost sheets for the signed-in user. Identity always comes from the
 * verified JWT principal — never from a client-supplied header.
 */
@RestController
@RequestMapping("/api/v1/calculations")
public class CalculationController {

    private final CalculationService calculationService;
    private final AccessControlService accessControlService;

    public CalculationController(CalculationService calculationService,
                                 AccessControlService accessControlService) {
        this.calculationService = calculationService;
        this.accessControlService = accessControlService;
    }

    @PostMapping
    public ResponseEntity<CalculationDto.CalculationResponse> createCalculation(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @Valid @RequestBody CalculationDto.CalculationRequest req) {
        requireFeature(principal, AccessControlService.Feature.CALCULATOR);
        requireFeature(principal, AccessControlService.Feature.SAVED_SHEETS);
        return ResponseEntity.ok(calculationService.createCalculation(requireUserId(principal), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalculationDto.CalculationResponse> getCalculation(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @PathVariable Long id) {
        // Reading your own saved sheets is always allowed — even after a plan
        // lapses. Locking users out of their own data would be a data-rights
        // problem (and a store-review risk); creation is what the plan pays for.
        return ResponseEntity.ok(calculationService.getCalculation(id, requireUserId(principal)));
    }

    @GetMapping
    public ResponseEntity<List<CalculationDto.CalculationResponse>> listCalculations(
            @AuthenticationPrincipal CustomerUserDetails principal) {
        return ResponseEntity.ok(calculationService.listCalculations(requireUserId(principal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCalculation(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @PathVariable Long id) {
        // Users can always delete their own data.
        calculationService.deleteCalculation(id, requireUserId(principal));
        return ResponseEntity.ok().build();
    }

    private void requireFeature(CustomerUserDetails principal, AccessControlService.Feature feature) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        accessControlService.require(principal.getUser(), feature);
    }

    private Long requireUserId(CustomerUserDetails principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        return principal.getUser().getId();
    }
}
