package com.gmpp.controller;

import com.gmpp.dto.UtilisateurDTO;
import com.gmpp.service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/utilisateurs")
@Tag(name = "Utilisateurs")
@SecurityRequirement(name = "bearerAuth")
public class UtilisateurController {

    private final UtilisateurService service;

    public UtilisateurController(UtilisateurService service) {
        this.service = service;
    }

    /** Lecture autorisée à ADMIN, RESPONSABLE_MAINTENANCE, CHEF_EQUIPE (pour lister techniciens). */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE')")
    @Operation(summary = "Liste tous les utilisateurs")
    public ResponseEntity<List<UtilisateurDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE')")
    @Operation(summary = "Détail d'un utilisateur")
    public ResponseEntity<UtilisateurDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    /** Création : ADMIN uniquement. */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un utilisateur")
    public ResponseEntity<UtilisateurDTO> create(@Valid @RequestBody UtilisateurDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    /** Modification : ADMIN uniquement (la gestion des comptes ne doit pas être partagée). */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Modifier un utilisateur")
    public ResponseEntity<UtilisateurDTO> update(@PathVariable Long id,
                                                  @RequestBody UtilisateurDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    /** Suppression : ADMIN uniquement. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un utilisateur")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
