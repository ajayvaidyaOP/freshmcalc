package com.freshmcalc.controller;

import com.freshmcalc.domain.service.PortService;
import com.freshmcalc.domain.service.PortChargeService;
import com.freshmcalc.dto.PortDto;
import com.freshmcalc.dto.PortChargeDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.Instant;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ports")
public class PortController {

    private final PortService portService;
    private final PortChargeService portChargeService;

    public PortController(PortService portService, PortChargeService portChargeService) {
        this.portService = portService;
        this.portChargeService = portChargeService;
    }

    @GetMapping
    public ResponseEntity<List<PortDto.PortResponse>> listPorts() {
        return ResponseEntity.ok(portService.listPorts());
    }

    @GetMapping("/countries")
    public ResponseEntity<List<PortDto.CountryResponse>> listCountries() {
        return ResponseEntity.ok(portService.listCountries());
    }

    @GetMapping("/cities")
    public ResponseEntity<List<PortDto.CityResponse>> listCities(@RequestParam Long countryId) {
        return ResponseEntity.ok(portService.listCities(countryId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PortDto.PortResponse> createPort(@Valid @RequestBody PortDto.CreatePortRequest req) {
        return ResponseEntity.ok(portService.createPort(req));
    }

    /** Active route charges for a selected shipment. Expired and unverified records remain visible with explicit status. */
    @GetMapping("/charges")
    public ResponseEntity<List<PortChargeDto.PortChargeResponse>> listApplicableCharges(
            @RequestParam Long originPortId,
            @RequestParam Long destinationPortId,
            @RequestParam(required = false) String containerType,
            @RequestParam(required = false) String shippingMode,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant asOf) {
        return ResponseEntity.ok(portChargeService.listApplicable(
            originPortId, destinationPortId, containerType, shippingMode, productName, asOf));
    }

    @GetMapping("/charges/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PortChargeDto.PortChargeResponse>> listAllCharges() {
        return ResponseEntity.ok(portChargeService.listAdmin());
    }

    @PostMapping("/charges")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PortChargeDto.PortChargeResponse> createCharge(
            @Valid @RequestBody PortChargeDto.PortChargeRequest req) {
        return ResponseEntity.ok(portChargeService.create(req));
    }

    @PutMapping("/charges/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PortChargeDto.PortChargeResponse> updateCharge(
            @PathVariable Long id,
            @Valid @RequestBody PortChargeDto.PortChargeRequest req) {
        return ResponseEntity.ok(portChargeService.update(id, req));
    }
}
