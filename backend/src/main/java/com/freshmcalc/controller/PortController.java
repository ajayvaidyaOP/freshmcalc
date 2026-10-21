package com.freshmcalc.controller;

import com.freshmcalc.domain.service.PortService;
import com.freshmcalc.dto.PortDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ports")
public class PortController {

    private final PortService portService;

    public PortController(PortService portService) {
        this.portService = portService;
    }

    @GetMapping
    public ResponseEntity<List<PortDto.PortResponse>> listPorts() {
        return ResponseEntity.ok(portService.listPorts());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PortDto.PortResponse> createPort(@Valid @RequestBody PortDto.CreatePortRequest req) {
        return ResponseEntity.ok(portService.createPort(req));
    }
}
