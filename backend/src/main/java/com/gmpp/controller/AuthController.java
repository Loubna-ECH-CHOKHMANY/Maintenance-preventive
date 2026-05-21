package com.gmpp.controller;

import com.gmpp.dto.AuthRequest;
import com.gmpp.dto.AuthResponse;
import com.gmpp.dto.RefreshTokenRequest;
import com.gmpp.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Login, refresh token, logout")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur",
               description = "Retourne un token JWT + refresh token",
               responses = {
                   @ApiResponse(responseCode = "200", description = "Connexion réussie"),
                   @ApiResponse(responseCode = "401", description = "Identifiants invalides"),
                   @ApiResponse(responseCode = "423", description = "Compte bloqué (brute force)")
               })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renouveler le token d'accès",
               description = "Utilise le refresh token pour obtenir un nouveau access token")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(authService.refreshToken(req.getRefreshToken()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Déconnexion", description = "Invalide la session côté client (stateless JWT)")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
