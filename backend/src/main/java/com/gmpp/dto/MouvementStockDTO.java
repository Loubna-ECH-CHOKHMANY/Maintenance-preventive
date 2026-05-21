package com.gmpp.dto;
import com.gmpp.enums.TypeMouvement;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MouvementStockDTO {
    private Long id;
    private Long pieceId;
    private String pieceDesignation;
    private String pieceReference;
    private TypeMouvement typeMouvement;
    private Integer quantite;
    private Integer quantiteAvant;
    private Integer quantiteApres;
    private String motif;
    private String referenceDocument;
    private Long utilisateurId;
    private String utilisateurNom;
    private Long interventionId;
    private Long panneId;
    private LocalDateTime createdAt;
}
