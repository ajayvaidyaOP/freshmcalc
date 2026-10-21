package com.freshmcalc.controller;

import com.freshmcalc.domain.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok(adminService.dashboardStats());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> auditLogs() {
        return ResponseEntity.ok(adminService.auditLogs());
    }
}
