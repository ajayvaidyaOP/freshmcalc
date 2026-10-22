package com.freshmcalc.controller;

import com.freshmcalc.domain.service.ShippingRouteService;
import com.freshmcalc.dto.RouteDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/routes")
public class RouteController {

    private final ShippingRouteService routeService;

    public RouteController(ShippingRouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public ResponseEntity<List<RouteDto.ShippingRouteResponse>> listRoutes() {
        return ResponseEntity.ok(routeService.listRoutes());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteDto.ShippingRouteResponse> createRoute(
            @Valid @RequestBody RouteDto.CreateShippingRouteRequest req) {
        return ResponseEntity.ok(routeService.createRoute(req));
    }

    @PostMapping("/freight-quotes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RouteDto.FreightQuoteResponse> createFreightQuote(@Valid @RequestBody RouteDto.CreateFreightQuoteRequest req) {
        return ResponseEntity.ok(routeService.createFreightQuote(req));
    }

    @GetMapping("/freight-quotes")
    public ResponseEntity<List<RouteDto.FreightQuoteResponse>> listFreightQuotes() {
        return ResponseEntity.ok(routeService.listFreightQuotes());
    }
}
