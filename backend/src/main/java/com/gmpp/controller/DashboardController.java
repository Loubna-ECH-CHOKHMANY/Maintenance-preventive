package com.gmpp.controller;

import com.gmpp.dto.DashboardDTO;
import com.gmpp.service.DashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    /** Rapport global : ADMIN et RESPONSABLE_MAINTENANCE uniquement. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    public ResponseEntity<DashboardDTO> get() {
        return ResponseEntity.ok(service.getDashboard());
    }
}
