package com.gmpp.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service @Slf4j
public class BruteForceProtectionService {
    @Value("${app.brute-force.max-attempts:5}")
    private int maxAttempts;
    @Value("${app.brute-force.block-duration-minutes:15}")
    private int blockDurationMinutes;

    private record AttemptInfo(int count, LocalDateTime lastAttempt, LocalDateTime blockedUntil) {}
    private final Map<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        AttemptInfo info = attempts.get(email);
        if (info == null) return false;
        if (info.blockedUntil() != null && LocalDateTime.now().isBefore(info.blockedUntil())) {
            return true;
        }
        if (info.blockedUntil() != null) {
            attempts.remove(email); // Debloquer automatiquement
        }
        return false;
    }

    public void loginFailed(String email) {
        AttemptInfo current = attempts.getOrDefault(email, new AttemptInfo(0, LocalDateTime.now(), null));
        int newCount = current.count() + 1;
        LocalDateTime blockedUntil = null;
        if (newCount >= maxAttempts) {
            blockedUntil = LocalDateTime.now().plusMinutes(blockDurationMinutes);
            log.warn("Compte bloqué: {} après {} tentatives", email, newCount);
        }
        attempts.put(email, new AttemptInfo(newCount, LocalDateTime.now(), blockedUntil));
    }

    public void loginSucceeded(String email) {
        attempts.remove(email);
    }

    public int getRemainingAttempts(String email) {
        AttemptInfo info = attempts.get(email);
        if (info == null) return maxAttempts;
        return Math.max(0, maxAttempts - info.count());
    }

    public LocalDateTime getBlockedUntil(String email) {
        AttemptInfo info = attempts.get(email);
        return info != null ? info.blockedUntil() : null;
    }
}
