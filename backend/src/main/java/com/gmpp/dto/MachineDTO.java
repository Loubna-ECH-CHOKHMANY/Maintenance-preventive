package com.gmpp.dto;
import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MachineDTO {
    private Long id;
    @NotBlank private String nom;
    @NotNull  private TypeMachine typeMachine;
    private String marque;
    private String modele;
    @NotBlank private String numeroSerie;
    private Integer anneeFabrication;
    private LocalDate dateMiseEnService;
    private String atelier;
    private String zone;
    private String ligneProduction;
    @NotNull private StatutMachine statut;
    private Long compteurHoraire;
    private int nombrePointsMaintenance;
    private int nombreInterventions;
}
