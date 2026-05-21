package com.gmpp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmpp.enums.CategoriePiece;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "pieces_rechange")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PieceRechange {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String reference;
    @Column(nullable = false)
    private String designation;
    @Enumerated(EnumType.STRING)
    private CategoriePiece categorie;
    private String marque;
    private String fournisseur;
    private String unite;
    private Integer quantiteStock;
    private Integer seuilAlerteMin;
    private Integer seuilAlerteMax;
    private Integer quantiteCommandeOptimale;
    private Double prixUnitaire;
    private String emplacement;
    private String description;

    @OneToMany(mappedBy = "piece", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<MouvementStock> mouvements;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
