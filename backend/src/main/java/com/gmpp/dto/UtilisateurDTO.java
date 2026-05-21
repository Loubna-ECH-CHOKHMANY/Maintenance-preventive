package com.gmpp.dto;
import com.gmpp.enums.RoleUtilisateur;
import com.gmpp.enums.Specialite;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UtilisateurDTO {
    private Long id;
    @NotBlank private String nomComplet;
    @NotBlank private String matricule;
    @Email @NotBlank private String email;
    private String motDePasse;
    @NotNull private RoleUtilisateur role;
    private List<Specialite> specialites;
    private List<String> certifications;
    private boolean actif;
    private int nombreInterventions;
}
