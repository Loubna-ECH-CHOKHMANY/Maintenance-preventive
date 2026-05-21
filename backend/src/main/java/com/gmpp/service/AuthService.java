package com.gmpp.service;

import com.gmpp.dto.AuthRequest;
import com.gmpp.dto.AuthResponse;
import com.gmpp.entity.Utilisateur;
import com.gmpp.repository.UtilisateurRepository;
import com.gmpp.security.BruteForceProtectionService;
import com.gmpp.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final BruteForceProtectionService bruteForce;
    private final UtilisateurRepository userRepo;
    private final AuditService auditService;

    public AuthResponse login(AuthRequest req) {
        String email = req.getEmail();

        if (bruteForce.isBlocked(email)) {
            var blockedUntil = bruteForce.getBlockedUntil(email);
            throw new LockedException("Compte bloqué jusqu'à " + blockedUntil + ". Trop de tentatives échouées.");
        }

        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, req.getMotDePasse()));
            Utilisateur user = (Utilisateur) auth.getPrincipal();
            bruteForce.loginSucceeded(email);
            auditService.log("LOGIN", "Utilisateur", user.getId(), "Connexion réussie depuis: " + email);

            return AuthResponse.builder()
                .token(jwtUtils.generateToken(user))
                .refreshToken(jwtUtils.generateRefreshToken(user))
                .email(user.getEmail())
                .nomComplet(user.getNomComplet())
                .role(user.getRole().name())
                .userId(user.getId())
                .matricule(user.getMatricule())
                .build();
        } catch (BadCredentialsException e) {
            bruteForce.loginFailed(email);
            int remaining = bruteForce.getRemainingAttempts(email);
            auditService.logErreur("LOGIN_FAILED", "Utilisateur", null, "Email: " + email);
            throw new BadCredentialsException("Email ou mot de passe incorrect. " + remaining + " tentative(s) restante(s).");
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateToken(refreshToken) || !jwtUtils.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Refresh token invalide ou expiré");
        }
        String email = jwtUtils.getEmailFromToken(refreshToken);
        Utilisateur user = userRepo.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("Utilisateur non trouvé"));

        return AuthResponse.builder()
            .token(jwtUtils.generateToken(user))
            .refreshToken(jwtUtils.generateRefreshToken(user))
            .email(user.getEmail())
            .nomComplet(user.getNomComplet())
            .role(user.getRole().name())
            .userId(user.getId())
            .matricule(user.getMatricule())
            .build();
    }
}
