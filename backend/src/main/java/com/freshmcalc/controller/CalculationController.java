package com.freshmcalc.controller;

import com.freshmcalc.domain.service.CalculationService;
import com.freshmcalc.dto.CalculationDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calculations")
public class CalculationController {

    private final CalculationService calculationService;

    public CalculationController(CalculationService calculationService) {
        this.calculationService = calculationService;
    }

    @PostMapping
    public ResponseEntity<CalculationDto.CalculationResponse> createCalculation(
            @RequestHeader(name = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody CalculationDto.CalculationRequest req) {
        if (userId == null) {
            throw new IllegalArgumentException("X-User-Id header is required");
        }
        return ResponseEntity.ok(calculationService.createCalculation(userId, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalculationDto.CalculationResponse> getCalculation(
            @PathVariable Long id,
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(calculationService.getCalculation(id, userId));
    }

    @GetMapping
    public ResponseEntity<List<CalculationDto.CalculationResponse>> listCalculations(
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(calculationService.listCalculations(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCalculation(
            @PathVariable Long id,
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        calculationService.deleteCalculation(id, userId);
        return ResponseEntity.ok().build();
    }
}
