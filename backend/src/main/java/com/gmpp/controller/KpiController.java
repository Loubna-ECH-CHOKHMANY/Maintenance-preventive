package com.gmpp.controller;

import com.gmpp.dto.KpiDTO;
import com.gmpp.service.KpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/kpi")
@RequiredArgsConstructor
@Tag(name = "KPI & Performance", description = "MTBF, MTTR, OEE, TRS, disponibilité machines")
@PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
public class KpiController {
    private final KpiService kpiService;

    @GetMapping("/machines")
    @Operation(summary = "KPI de toutes les machines",
               description = "MTBF, MTTR, OEE, TRS, disponibilité pour chaque machine")
    public ResponseEntity<List<KpiDTO>> getAllKpi(
            @Parameter(description = "Période: semaine, mois, trimestre, annee")
            @RequestParam(defaultValue = "mois") String periode) {
        return ResponseEntity.ok(kpiService.getKpiToutes(periode));
    }

    @GetMapping("/machines/{machineId}")
    @Operation(summary = "KPI d'une machine spécifique")
    public ResponseEntity<KpiDTO> getKpiMachine(
            @PathVariable Long machineId,
            @RequestParam(defaultValue = "mois") String periode) {
        return ResponseEntity.ok(kpiService.getKpiMachine(machineId, periode));
    }
}
