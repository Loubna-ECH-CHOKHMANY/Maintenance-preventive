package com.gmpp.dto;
import com.gmpp.enums.FrequenceIntervention;
import com.gmpp.enums.TypeOperation;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PointMaintenanceDTO {
    private Long id;
    @NotNull private TypeOperation typeOperation;
    private String description;
    private String localisationSurMachine;
    private String typeConsommable;
    private String referenceConsommable;
    private Double quantiteNecessaire;
    private String uniteQuantite;
    @NotNull private FrequenceIntervention frequence;
    private Integer intervalleHeures;
    private LocalDate prochaineDatePrevue;
    @NotNull private Long machineId;
    private String machineNom;
}
