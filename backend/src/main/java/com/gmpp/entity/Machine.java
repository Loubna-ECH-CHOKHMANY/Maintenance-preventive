package com.gmpp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "machines")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Machine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nom;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private TypeMachine typeMachine;
    private String marque;
    private String modele;
    @Column(unique = true, nullable = false)
    private String numeroSerie;
    private Integer anneeFabrication;
    private LocalDate dateMiseEnService;
    private String atelier;
    private String zone;
    private String ligneProduction;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private StatutMachine statut;
    @Builder.Default
    private Long compteurHoraire = 0L;
    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "machine", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<PointMaintenance> pointsMaintenance;

    @OneToMany(mappedBy = "machine", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<Intervention> interventions;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
