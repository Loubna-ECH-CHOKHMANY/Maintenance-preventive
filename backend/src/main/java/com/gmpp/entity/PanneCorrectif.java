package com.gmpp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmpp.enums.NiveauUrgence;
import com.gmpp.enums.StatutPanne;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "pannes_correctifs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PanneCorrectif {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Utilisateur technicien;

    @Column(nullable = false)
    private String titre;
    @Column(length = 5000)
    private String description;
    @Enumerated(EnumType.STRING)
    private NiveauUrgence urgence;
    @Enumerated(EnumType.STRING)
    private StatutPanne statut;
    private LocalDateTime dateDeclaration;
    private LocalDateTime dateDebutIntervention;
    private LocalDateTime dateFinIntervention;
    private Integer tempsPanneMinutes;
    private Integer tempsReparationMinutes;
    @Column(length = 3000)
    private String causesIdentifiees;
    @Column(length = 3000)
    private String actionsCorrectivesEffectuees;
    @Column(length = 3000)
    private String pieceUtilisees;
    private Double coutReparation;

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(name = "photo_url")
    private List<String> photos;

    private String signatureTechnicien;
    private boolean valideParResponsable;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() {
        createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now();
        if (dateDeclaration == null) dateDeclaration = LocalDateTime.now();
        if (statut == null) statut = StatutPanne.DECLAREE;
    }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
