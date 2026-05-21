package com.gmpp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gmpp.enums.TypeNotification;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "interventions",
        "motDePasse", "specialites", "certifications", "authorities", "accountNonExpired",
        "accountNonLocked", "credentialsNonExpired", "enabled", "username", "password"})
    private Utilisateur destinataire;

    @Enumerated(EnumType.STRING)
    private TypeNotification type;

    private String titre;

    @Column(length = 2000)
    private String message;

    private boolean lue;
    private boolean envoyeeEmail;

    private String lienAction;
    private Long entiteId;
    private String entiteType;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime lueLe;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
