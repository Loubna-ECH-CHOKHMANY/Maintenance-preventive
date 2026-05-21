package com.gmpp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "audit_logs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String utilisateurEmail;
    private String action;
    private String entite;
    private Long entiteId;

    @Column(length = 5000)
    private String details;

    private String ipAddress;
    private boolean succes;
    private String messageErreur;

    @Column(updatable = false)
    private LocalDateTime timestamp;

    @PrePersist protected void onCreate() { timestamp = LocalDateTime.now(); }
}
