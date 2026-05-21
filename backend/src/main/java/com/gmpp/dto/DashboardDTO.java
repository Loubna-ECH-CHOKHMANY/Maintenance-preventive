package com.gmpp.dto;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardDTO {
    // Machines
    private long totalMachines;
    private long machinesEnService;
    private long machinesEnMaintenance;
    private long machinesHorsService;
    // Interventions
    private long totalInterventions;
    private long interventionsPlanifiees;
    private long interventionsTerminees;
    private long interventionsEnRetard;
    private long interventionsEnCours;
    private double tauxRealisationPlanning;
    private double tempsMoyenIntervention;
    // Lists
    private List<InterventionDTO> prochainesInterventions;
    private List<InterventionDTO> interventionsEnRetardList;
}
