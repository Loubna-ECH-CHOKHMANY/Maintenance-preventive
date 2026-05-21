package com.gmpp.dto;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardProDTO {
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
    // Pannes
    private long totalPannes;
    private long pannesOuvertes;
    private double mtbfGlobal;
    private double mttrGlobal;
    // Stock
    private long piecesEnAlerte;
    private long piecesEnRupture;
    // Notifications
    private long notificationsNonLues;
    // Listes
    private List<InterventionDTO> prochainesInterventions;
    private List<InterventionDTO> interventionsEnRetardList;
    private List<PieceRechangeDTO> piecesEnAlerteList;
    private List<KpiDTO> kpisParMachine;
}
