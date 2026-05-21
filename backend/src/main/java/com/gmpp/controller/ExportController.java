package com.gmpp.controller;

import com.gmpp.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
@Tag(name = "Export & Rapports", description = "Export PDF, Excel et CSV des données GMPP")
@PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
public class ExportController {
    private final ExportService exportService;

    @GetMapping("/interventions/csv")
    @Operation(summary = "Exporter les interventions en CSV")
    public ResponseEntity<byte[]> exportInterventionsCSV() throws Exception {
        byte[] data = exportService.exportInterventionsCSV();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=interventions.csv")
            .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
            .body(data);
    }

    @GetMapping("/interventions/excel")
    @Operation(summary = "Exporter les interventions en Excel")
    public ResponseEntity<byte[]> exportInterventionsExcel() throws Exception {
        byte[] data = exportService.exportInterventionsExcel();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=interventions.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(data);
    }

    @GetMapping("/stock/csv")
    @Operation(summary = "Exporter le stock en CSV")
    public ResponseEntity<byte[]> exportStockCSV() throws Exception {
        byte[] data = exportService.exportStockCSV();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock.csv")
            .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
            .body(data);
    }

    @GetMapping("/stock/excel")
    @Operation(summary = "Exporter le stock en Excel")
    public ResponseEntity<byte[]> exportStockExcel() throws Exception {
        byte[] data = exportService.exportStockExcel();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(data);
    }

    @GetMapping("/rapport/pdf")
    @Operation(summary = "Exporter le rapport global en PDF")
    public ResponseEntity<byte[]> exportRapportPDF(
            @RequestParam(defaultValue = "Rapport GMPP") String titre) throws Exception {
        byte[] data = exportService.exportRapportPDF(titre, "Rapport généré automatiquement par GMPP Pro");
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport-gmpp.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(data);
    }
}
