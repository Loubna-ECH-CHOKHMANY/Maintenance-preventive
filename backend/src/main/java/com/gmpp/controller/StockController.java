package com.gmpp.controller;

import com.gmpp.dto.MouvementStockDTO;
import com.gmpp.dto.PieceRechangeDTO;
import com.gmpp.enums.TypeMouvement;
import com.gmpp.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
@Tag(name = "Stock Pièces de Rechange", description = "Gestion du stock, mouvements, alertes seuil")
@SecurityRequirement(name = "bearerAuth")
public class StockController {
    private final StockService stockService;

    @GetMapping("/pieces")
    @Operation(summary = "Lister toutes les pièces de rechange")
    public ResponseEntity<List<PieceRechangeDTO>> getAllPieces() {
        return ResponseEntity.ok(stockService.getAll());
    }

    @GetMapping("/pieces/{id}")
    @Operation(summary = "Obtenir une pièce par ID")
    public ResponseEntity<PieceRechangeDTO> getPiece(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getById(id));
    }

    @GetMapping("/pieces/alertes")
    @Operation(summary = "Pièces en alerte de stock bas")
    public ResponseEntity<List<PieceRechangeDTO>> getPiecesEnAlerte() {
        return ResponseEntity.ok(stockService.getPiecesEnAlerte());
    }

    @GetMapping("/pieces/ruptures")
    @Operation(summary = "Pièces en rupture de stock")
    public ResponseEntity<List<PieceRechangeDTO>> getPiecesEnRupture() {
        return ResponseEntity.ok(stockService.getPiecesEnRupture());
    }

    @PostMapping("/pieces")
    @Operation(summary = "Ajouter une pièce de rechange")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    public ResponseEntity<PieceRechangeDTO> creerPiece(@Valid @RequestBody PieceRechangeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.creer(dto));
    }

    @PutMapping("/pieces/{id}")
    @Operation(summary = "Modifier une pièce de rechange")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE')")
    public ResponseEntity<PieceRechangeDTO> modifierPiece(
            @PathVariable Long id, @Valid @RequestBody PieceRechangeDTO dto) {
        return ResponseEntity.ok(stockService.modifier(id, dto));
    }

    @DeleteMapping("/pieces/{id}")
    @Operation(summary = "Supprimer une pièce de rechange")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimerPiece(@PathVariable Long id) {
        stockService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/pieces/{id}/mouvement")
    @Operation(summary = "Enregistrer un mouvement de stock")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE','TECHNICIEN')")
    public ResponseEntity<MouvementStockDTO> enregistrerMouvement(
            @PathVariable Long id,
            @RequestParam TypeMouvement type,
            @RequestParam Integer quantite,
            @RequestParam(required = false) String motif,
            @Parameter(description = "ID de l'utilisateur (optionnel)")
            @RequestParam(required = false, defaultValue = "") String userId,
            @RequestParam(required = false) Long interventionId,
            @RequestParam(required = false) Long panneId) {
        // Parse userId safely - empty string -> null
        Long userIdLong = null;
        if (userId != null && !userId.isBlank()) {
            try { userIdLong = Long.parseLong(userId); } catch (NumberFormatException ignored) {}
        }
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(stockService.enregistrerMouvement(id, type, quantite, motif, userIdLong, interventionId, panneId));
    }

    @GetMapping("/pieces/{id}/historique")
    @Operation(summary = "Historique des mouvements d'une pièce")
    public ResponseEntity<List<MouvementStockDTO>> getHistorique(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getHistorique(id));
    }

    @GetMapping("/resume")
    @Operation(summary = "Résumé du stock (total, alertes, ruptures, valeur)")
    public ResponseEntity<Map<String, Object>> getResume() {
        List<PieceRechangeDTO> toutes = stockService.getAll();
        long enAlerte  = toutes.stream().filter(PieceRechangeDTO::isEnAlerte).count();
        long enRupture = toutes.stream().filter(PieceRechangeDTO::isEnRupture).count();
        double valeurTotale = toutes.stream()
            .filter(p -> p.getPrixUnitaire() != null && p.getQuantiteStock() != null)
            .mapToDouble(p -> p.getPrixUnitaire() * p.getQuantiteStock()).sum();
        return ResponseEntity.ok(Map.of(
            "totalPieces",      toutes.size(),
            "enAlerte",         enAlerte,
            "enRupture",        enRupture,
            "valeurTotaleStock", Math.round(valeurTotale * 100.0) / 100.0
        ));
    }
}
