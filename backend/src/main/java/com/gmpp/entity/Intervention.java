package com.gmpp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmpp.enums.EtatConstate;
import com.gmpp.enums.StatutIntervention;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "interventions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Intervention {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_maintenance_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private PointMaintenance pointMaintenance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Utilisateur technicien;

    @Column(nullable = false)
    private LocalDateTime datePlanifiee;
    private LocalDateTime dateReelleExecution;
    private Integer dureeEffectiveMinutes;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private StatutIntervention statut;

    @Column(length = 2000)
    private String observationsTechnicien;

    @Enumerated(EnumType.STRING)
    private EtatConstate etatConstate;

    @Builder.Default private boolean confirmeParTechnicien = false;
    @Builder.Default private boolean valideParResponsable  = false;
    private String justificationAnnulation;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
