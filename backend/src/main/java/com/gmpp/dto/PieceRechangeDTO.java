package com.gmpp.dto;
import com.gmpp.enums.CategoriePiece;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PieceRechangeDTO {
    private Long id;
    private String reference;
    private String designation;
    private CategoriePiece categorie;
    private String marque;
    private String fournisseur;
    private String unite;
    private Integer quantiteStock;
    private Integer seuilAlerteMin;
    private Integer seuilAlerteMax;
    private Integer quantiteCommandeOptimale;
    private Double prixUnitaire;
    private String emplacement;
    private String description;
    private boolean enAlerte;
    private boolean enRupture;
    private LocalDateTime createdAt;
}
