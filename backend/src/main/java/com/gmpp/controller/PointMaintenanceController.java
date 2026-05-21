package com.gmpp.controller;

import com.gmpp.dto.PointMaintenanceDTO;
import com.gmpp.service.PointMaintenanceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/points-maintenance")
@Tag(name = "Points de Maintenance")
@SecurityRequirement(name = "bearerAuth")
public class PointMaintenanceController {

    private final PointMaintenanceService service;

    public PointMaintenanceController(PointMaintenanceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PointMaintenanceDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PointMaintenanceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/machine/{machineId}")
    public ResponseEntity<List<PointMaintenanceDTO>> byMachine(@PathVariable Long machineId) {
        return ResponseEntity.ok(service.findByMachine(machineId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    public ResponseEntity<PointMaintenanceDTO> create(@Valid @RequestBody PointMaintenanceDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    public ResponseEntity<PointMaintenanceDTO> update(
            @PathVariable Long id,
            @RequestBody PointMaintenanceDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
