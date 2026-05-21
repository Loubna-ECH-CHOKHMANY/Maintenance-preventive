package com.gmpp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmpp.enums.FrequenceIntervention;
import com.gmpp.enums.TypeOperation;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "points_maintenance")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PointMaintenance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private TypeOperation typeOperation;
    @Column(length = 1000)
    private String description;
    private String localisationSurMachine;
    private String typeConsommable;
    private String referenceConsommable;
    private Double quantiteNecessaire;
    private String uniteQuantite;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private FrequenceIntervention frequence;
    private Integer intervalleHeures;
    private LocalDate prochaineDatePrevue;
    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Machine machine;

    @OneToMany(mappedBy = "pointMaintenance", fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<Intervention> interventions;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
