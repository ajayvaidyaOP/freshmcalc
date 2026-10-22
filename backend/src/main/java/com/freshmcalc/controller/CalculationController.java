package com.freshmcalc.controller;

import com.freshmcalc.config.security.CustomerUserDetails;
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

    public CalculationController(CalculationService calculationService) {
        this.calculationService = calculationService;
    }

    @PostMapping
    public ResponseEntity<CalculationDto.CalculationResponse> createCalculation(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @Valid @RequestBody CalculationDto.CalculationRequest req) {
        return ResponseEntity.ok(calculationService.createCalculation(requireUserId(principal), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalculationDto.CalculationResponse> getCalculation(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @PathVariable Long id) {
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
        calculationService.deleteCalculation(id, requireUserId(principal));
        return ResponseEntity.ok().build();
    }

    private Long requireUserId(CustomerUserDetails principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        return principal.getUser().getId();
    }
}
