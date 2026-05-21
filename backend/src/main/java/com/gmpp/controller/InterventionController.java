package com.gmpp.controller;

import com.gmpp.dto.*;
import com.gmpp.service.InterventionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/interventions")
@Tag(name = "Interventions")
@SecurityRequirement(name = "bearerAuth")
public class InterventionController {

    private final InterventionService service;

    public InterventionController(InterventionService service) {
        this.service = service;
    }

    /**
     * Liste toutes les interventions.
     * - TECHNICIEN : uniquement ses interventions (filtrage appliqué dans le service)
     * - Autres rôles : toutes les interventions
     */
    @GetMapping
    @Operation(summary = "Liste des interventions (filtrée pour TECHNICIEN)")
    public ResponseEntity<List<InterventionDTO>> getAll(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(service.findAllForUser(principal));
    }

    /**
     * Détail d'une intervention.
     * Le service vérifie que le TECHNICIEN accède uniquement à ses propres interventions.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une intervention")
    public ResponseEntity<InterventionDTO> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(service.findByIdForUser(id, principal));
    }

    /**
     * Créer une intervention : ADMIN, RESPONSABLE_MAINTENANCE ou CHEF_EQUIPE.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE')")
    @Operation(summary = "Créer une intervention")
    public ResponseEntity<InterventionDTO> create(@Valid @RequestBody InterventionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    /**
     * Modifier une intervention.
     * - TECHNICIEN : peut uniquement mettre à jour observations/statut/durée de SES interventions
     * - CHEF_EQUIPE : peut modifier date planifiée et technicien assigné
     * - ADMIN/RESPONSABLE : accès complet
     */
    @PutMapping("/{id}")
    @Operation(summary = "Modifier une intervention")
    public ResponseEntity<InterventionDTO> update(
            @PathVariable Long id,
            @RequestBody InterventionDTO dto,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(service.updateForUser(id, dto, principal));
    }

    /**
     * Supprimer : ADMIN ou RESPONSABLE_MAINTENANCE.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Supprimer une intervention")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Technicien confirme l'exécution — uniquement sur SES interventions.
     */
    @PostMapping("/{id}/confirmer")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE','TECHNICIEN')")
    @Operation(summary = "Technicien confirme l'exécution")
    public ResponseEntity<InterventionDTO> confirmer(
            @PathVariable Long id,
            @RequestBody ConfirmerRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(service.confirmerForUser(id, req, principal));
    }

    /**
     * Valider une intervention : ADMIN, RESPONSABLE_MAINTENANCE ou CHEF_EQUIPE.
     */
    @PostMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE')")
    @Operation(summary = "Valider une intervention")
    public ResponseEntity<InterventionDTO> valider(@PathVariable Long id) {
        return ResponseEntity.ok(service.valider(id));
    }

    /**
     * Annuler une intervention : ADMIN ou RESPONSABLE_MAINTENANCE uniquement.
     */
    @PostMapping("/{id}/annuler")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Annuler une intervention")
    public ResponseEntity<InterventionDTO> annuler(
            @PathVariable Long id,
            @RequestParam String justification) {
        return ResponseEntity.ok(service.annuler(id, justification));
    }

    /**
     * Interventions par machine — interdit au TECHNICIEN (rapport global).
     */
    @GetMapping("/machine/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE')")
    @Operation(summary = "Interventions d'une machine")
    public ResponseEntity<List<InterventionDTO>> byMachine(@PathVariable Long id) {
        return ResponseEntity.ok(service.findByMachine(id));
    }

    /**
     * Interventions par technicien.
     * TECHNICIEN ne peut consulter que les siennes (vérification dans le service).
     */
    @GetMapping("/technicien/{id}")
    @Operation(summary = "Interventions d'un technicien")
    public ResponseEntity<List<InterventionDTO>> byTechnicien(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(service.findByTechnicienForUser(id, principal));
    }

    /**
     * Interventions sur une période — rapport global, interdit au TECHNICIEN.
     */
    @GetMapping("/periode")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE')")
    @Operation(summary = "Interventions sur une période")
    public ResponseEntity<List<InterventionDTO>> byPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(service.findByPeriode(start, end));
    }
}
