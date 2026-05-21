package com.gmpp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmpp.enums.TypeMouvement;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "mouvements_stock")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MouvementStock {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piece_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private PieceRechange piece;

    @Enumerated(EnumType.STRING)
    private TypeMouvement typeMouvement;

    private Integer quantite;
    private Integer quantiteAvant;
    private Integer quantiteApres;
    private String motif;
    private String referenceDocument;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intervention_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Intervention intervention;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panne_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private PanneCorrectif panne;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
