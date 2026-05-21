package com.gmpp.controller;

import com.gmpp.entity.AuditLog;
import com.gmpp.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
@Tag(name = "Audit & Logs", description = "Traçabilité de toutes les actions utilisateurs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {
    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Lister les logs d'audit (paginé)")
    public ResponseEntity<Page<AuditLog>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(auditService.getAll(page, Math.min(size, 200)));
    }

    @GetMapping("/utilisateur/{email}")
    @Operation(summary = "Logs d'un utilisateur spécifique")
    public ResponseEntity<List<AuditLog>> getByUtilisateur(@PathVariable String email) {
        return ResponseEntity.ok(auditService.getByUtilisateur(email));
    }

    @GetMapping("/entite/{entite}/{id}")
    @Operation(summary = "Logs d'une entité spécifique")
    public ResponseEntity<List<AuditLog>> getByEntite(
            @PathVariable String entite, @PathVariable Long id) {
        return ResponseEntity.ok(auditService.getByEntite(entite, id));
    }
}
