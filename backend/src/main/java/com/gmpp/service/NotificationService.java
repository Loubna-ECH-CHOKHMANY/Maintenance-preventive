package com.gmpp.service;

import com.gmpp.entity.Notification;
import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.RoleUtilisateur;
import com.gmpp.enums.TypeNotification;
import com.gmpp.repository.NotificationRepository;
import com.gmpp.repository.UtilisateurRepository;
import com.gmpp.websocket.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor @Slf4j
public class NotificationService {
    private final NotificationRepository  notificationRepository;
    private final UtilisateurRepository   utilisateurRepository;
    private final NotificationWebSocketHandler wsHandler;

    @Async
    @Transactional
    public void notifier(Long userId, TypeNotification type, String titre, String message,
                         String lienAction, Long entiteId, String entiteType) {
        try {
            Utilisateur user = utilisateurRepository.findById(userId).orElse(null);
            if (user == null) return;

            Notification n = Notification.builder()
                .destinataire(user)
                .type(type)
                .titre(titre)
                .message(message)
                .lue(false)
                .envoyeeEmail(false)
                .lienAction(lienAction)
                .entiteId(entiteId)
                .entiteType(entiteType)
                .build();
            notificationRepository.save(n);

            // Push via WebSocket
            wsHandler.sendToUser(userId, titre + ": " + message);
        } catch (Exception e) {
            log.error("Erreur envoi notification userId={}: {}", userId, e.getMessage());
        }
    }

    @Async
    @Transactional
    public void notifierTousAdmins(TypeNotification type, String titre, String message) {
        try {
            // Use findByRole instead of findAll() + stream
            List<Utilisateur> admins = utilisateurRepository.findByRole(RoleUtilisateur.ADMIN);
            List<Utilisateur> resps  = utilisateurRepository.findByRole(RoleUtilisateur.RESPONSABLE_MAINTENANCE);
            admins.forEach(u -> notifier(u.getId(), type, titre, message, null, null, null));
            resps .forEach(u -> notifier(u.getId(), type, titre, message, null, null, null));
        } catch (Exception e) {
            log.error("Erreur notifierTousAdmins: {}", e.getMessage());
        }
    }

    public List<Notification> getMesNotifications(Long userId) {
        return notificationRepository.findByDestinataireIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getMesNonLues(Long userId) {
        return notificationRepository.findByDestinataireIdAndLueFalseOrderByCreatedAtDesc(userId);
    }

    public long countNonLues(Long userId) {
        return notificationRepository.countByDestinataireIdAndLueFalse(userId);
    }

    @Transactional
    public void marquerLue(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            n.setLue(true);
            n.setLueLe(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void marquerToutesLues(Long userId) {
        List<Notification> nonLues =
            notificationRepository.findByDestinataireIdAndLueFalseOrderByCreatedAtDesc(userId);
        LocalDateTime now = LocalDateTime.now();
        nonLues.forEach(n -> { n.setLue(true); n.setLueLe(now); });
        notificationRepository.saveAll(nonLues);
    }
}
