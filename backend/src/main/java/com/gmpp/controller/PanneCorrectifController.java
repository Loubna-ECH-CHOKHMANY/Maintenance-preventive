package com.gmpp.controller;

import com.gmpp.dto.PanneCorrectifDTO;
import com.gmpp.service.PanneCorrectifService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/pannes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Maintenance Corrective", description = "Gestion des pannes et interventions correctives")
public class PanneCorrectifController {
    private final PanneCorrectifService panneService;

    @GetMapping
    @Operation(summary = "Lister toutes les pannes")
    public ResponseEntity<List<PanneCorrectifDTO>> getAll() {
        return ResponseEntity.ok(panneService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une panne par ID")
    public ResponseEntity<PanneCorrectifDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(panneService.getById(id));
    }

    @GetMapping("/machine/{machineId}")
    @Operation(summary = "Pannes par machine")
    public ResponseEntity<List<PanneCorrectifDTO>> getByMachine(
            @Parameter(description = "ID de la machine") @PathVariable Long machineId) {
        return ResponseEntity.ok(panneService.getByMachine(machineId));
    }

    @PostMapping
    @Operation(summary = "Déclarer une panne", description = "Crée un ticket de maintenance corrective")
    public ResponseEntity<PanneCorrectifDTO> declarer(@Valid @RequestBody PanneCorrectifDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(panneService.declarer(dto));
    }

    @PutMapping("/{id}/resoudre")
    @Operation(summary = "Résoudre une panne", description = "Enregistrer la résolution + temps réparation")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','TECHNICIEN','CHEF_EQUIPE')")
    public ResponseEntity<PanneCorrectifDTO> resoudre(
            @PathVariable Long id, @RequestBody PanneCorrectifDTO dto) {
        return ResponseEntity.ok(panneService.resoudre(id, dto));
    }

    @PutMapping("/{id}/valider")
    @Operation(summary = "Valider la résolution", description = "Validation par le responsable")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    public ResponseEntity<PanneCorrectifDTO> valider(@PathVariable Long id) {
        return ResponseEntity.ok(panneService.valider(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une panne")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        panneService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
