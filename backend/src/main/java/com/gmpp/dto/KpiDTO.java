package com.gmpp.dto;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class KpiDTO {
    private Long machineId;
    private String machineNom;
    private Double mtbf;           // Mean Time Between Failures (heures)
    private Double mttr;           // Mean Time To Repair (heures)
    private Double oee;            // Overall Equipment Effectiveness (%)
    private Double trs;            // Taux de Rendement Synthétique (%)
    private Double disponibilite;  // % disponibilité
    private Double performance;    // % performance
    private Double qualite;        // % qualité
    private Integer nombrePannes;
    private Integer interventionsRealisees;
    private Double tauxRealisationPlanning;
    private Double tempsMoyenIntervention;
    private String periode;
}
