package com.gmpp.controller;

import com.gmpp.entity.Notification;
import com.gmpp.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Notifications", description = "Centre de notifications temps réel")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Toutes les notifications d'un utilisateur")
    public ResponseEntity<List<Notification>> getMesNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getMesNotifications(userId));
    }

    @GetMapping("/user/{userId}/non-lues")
    @Operation(summary = "Notifications non lues")
    public ResponseEntity<List<Notification>> getNonLues(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getMesNonLues(userId));
    }

    @GetMapping("/user/{userId}/count")
    @Operation(summary = "Nombre de notifications non lues")
    public ResponseEntity<Map<String, Long>> getCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.countNonLues(userId)));
    }

    @PutMapping("/{id}/lire")
    @Operation(summary = "Marquer une notification comme lue")
    public ResponseEntity<Void> marquerLue(@PathVariable Long id) {
        notificationService.marquerLue(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/user/{userId}/lire-tout")
    @Operation(summary = "Marquer toutes les notifications comme lues")
    public ResponseEntity<Void> marquerToutesLues(@PathVariable Long userId) {
        notificationService.marquerToutesLues(userId);
        return ResponseEntity.ok().build();
    }
}
