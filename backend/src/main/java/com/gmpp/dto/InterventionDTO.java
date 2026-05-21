package com.gmpp.dto;
import com.gmpp.enums.EtatConstate;
import com.gmpp.enums.StatutIntervention;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InterventionDTO {
    private Long id;
    @NotNull private Long machineId;
    private String machineNom;
    private Long pointMaintenanceId;
    private String typeOperation;
    private String pointMaintenanceNom;  // FIX: used by PlanningPage
    private Long technicienId;
    private String technicienNom;
    @NotNull private LocalDateTime datePlanifiee;
    private LocalDateTime dateReelleExecution;
    private Integer dureeEffectiveMinutes;
    private StatutIntervention statut;
    private String observationsTechnicien;
    private EtatConstate etatConstate;
    private boolean confirmeParTechnicien;
    private boolean valideParResponsable;
    private String justificationAnnulation;
}
