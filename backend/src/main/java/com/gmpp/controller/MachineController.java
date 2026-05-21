package com.gmpp.controller;
import com.gmpp.dto.MachineDTO;
import com.gmpp.enums.StatutMachine;
import com.gmpp.service.MachineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/machines")
@Tag(name = "Machines") @SecurityRequirement(name = "bearerAuth")
public class MachineController {
    private final MachineService service;
    public MachineController(MachineService service) { this.service = service; }

    @GetMapping @Operation(summary = "Liste toutes les machines")
    public ResponseEntity<List<MachineDTO>> getAll() { return ResponseEntity.ok(service.findAll()); }

    @GetMapping("/{id}") @Operation(summary = "Détail d'une machine")
    public ResponseEntity<MachineDTO> getById(@PathVariable Long id) { return ResponseEntity.ok(service.findById(id)); }

    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Créer une machine")
    public ResponseEntity<MachineDTO> create(@Valid @RequestBody MachineDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Modifier une machine")
    public ResponseEntity<MachineDTO> update(@PathVariable Long id, @Valid @RequestBody MachineDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une machine")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }

    @GetMapping("/statut/{statut}") @Operation(summary = "Filtrer par statut")
    public ResponseEntity<List<MachineDTO>> byStatut(@PathVariable StatutMachine statut) { return ResponseEntity.ok(service.findByStatut(statut)); }

    @PatchMapping("/{id}/compteur") @Operation(summary = "Mettre à jour le compteur horaire")
    public ResponseEntity<MachineDTO> updateCompteur(@PathVariable Long id, @RequestParam Long heures) {
        return ResponseEntity.ok(service.updateCompteur(id, heures));
    }
}
