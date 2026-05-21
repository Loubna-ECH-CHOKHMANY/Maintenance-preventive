package com.gmpp.dto;
import com.gmpp.enums.NiveauUrgence;
import com.gmpp.enums.StatutPanne;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PanneCorrectifDTO {
    private Long id;
    private Long machineId;
    private String machineNom;
    private Long technicienId;
    private String technicienNom;
    private String titre;
    private String description;
    private NiveauUrgence urgence;
    private StatutPanne statut;
    private LocalDateTime dateDeclaration;
    private LocalDateTime dateDebutIntervention;
    private LocalDateTime dateFinIntervention;
    private Integer tempsPanneMinutes;
    private Integer tempsReparationMinutes;
    private String causesIdentifiees;
    private String actionsCorrectivesEffectuees;
    private String pieceUtilisees;
    private Double coutReparation;
    private List<String> photos;
    private String signatureTechnicien;
    private boolean valideParResponsable;
    private LocalDateTime createdAt;
}
