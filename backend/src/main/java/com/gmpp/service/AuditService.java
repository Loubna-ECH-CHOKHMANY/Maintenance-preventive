package com.gmpp.service;

import com.gmpp.entity.AuditLog;
import com.gmpp.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service @RequiredArgsConstructor @Slf4j
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entite, Long entiteId, String details) {
        try {
            AuditLog audit = AuditLog.builder()
                .utilisateurEmail(getCurrentUserEmail())
                .action(action).entite(entite).entiteId(entiteId)
                .details(details).succes(true).build();
            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.warn("AuditLog skipped: {}", e.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logErreur(String action, String entite, Long entiteId, String erreur) {
        try {
            AuditLog audit = AuditLog.builder()
                .utilisateurEmail(getCurrentUserEmail())
                .action(action).entite(entite).entiteId(entiteId)
                .succes(false).messageErreur(erreur).build();
            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.warn("AuditLog error skipped: {}", e.getMessage());
        }
    }

    private String getCurrentUserEmail() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null && auth.isAuthenticated() ? auth.getName() : "SYSTEM";
        } catch (Exception e) { return "SYSTEM"; }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAll(int page, int size) {
        return auditLogRepository.findByOrderByTimestampDesc(PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getByUtilisateur(String email) {
        return auditLogRepository.findByUtilisateurEmailOrderByTimestampDesc(email);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getByEntite(String entite, Long id) {
        return auditLogRepository.findByEntiteAndEntiteId(entite, id);
    }
}
