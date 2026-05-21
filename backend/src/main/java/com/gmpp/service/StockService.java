package com.gmpp.service;

import com.gmpp.dto.MouvementStockDTO;
import com.gmpp.dto.PieceRechangeDTO;
import com.gmpp.entity.*;
import com.gmpp.enums.TypeMouvement;
import com.gmpp.enums.TypeNotification;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class StockService {
    private final PieceRechangeRepository pieceRepo;
    private final MouvementStockRepository mouvementRepo;
    private final UtilisateurRepository userRepo;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<PieceRechangeDTO> getAll() {
        return pieceRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PieceRechangeDTO getById(Long id) {
        return toDTO(pieceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PieceRechange", id)));
    }

    @Transactional
    public PieceRechangeDTO creer(PieceRechangeDTO dto) {
        if (pieceRepo.existsByReference(dto.getReference()))
            throw new IllegalArgumentException("Référence déjà existante: " + dto.getReference());
        PieceRechange piece = fromDTO(dto);
        piece = pieceRepo.save(piece);
        try { auditService.log("CREATE", "PieceRechange", piece.getId(), "Création: " + piece.getDesignation()); }
        catch (Exception e) { log.warn("audit skipped"); }
        return toDTO(piece);
    }

    @Transactional
    public PieceRechangeDTO modifier(Long id, PieceRechangeDTO dto) {
        PieceRechange piece = pieceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PieceRechange", id));
        piece.setDesignation(dto.getDesignation());
        piece.setCategorie(dto.getCategorie());
        piece.setMarque(dto.getMarque());
        piece.setFournisseur(dto.getFournisseur());
        piece.setUnite(dto.getUnite());
        piece.setSeuilAlerteMin(dto.getSeuilAlerteMin());
        piece.setSeuilAlerteMax(dto.getSeuilAlerteMax());
        piece.setQuantiteCommandeOptimale(dto.getQuantiteCommandeOptimale());
        piece.setPrixUnitaire(dto.getPrixUnitaire());
        piece.setEmplacement(dto.getEmplacement());
        piece.setDescription(dto.getDescription());
        try { auditService.log("UPDATE", "PieceRechange", id, "Modif: " + piece.getDesignation()); }
        catch (Exception e) { log.warn("audit skipped"); }
        return toDTO(pieceRepo.save(piece));
    }

    @Transactional
    public void supprimer(Long id) {
        PieceRechange piece = pieceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PieceRechange", id));
        try { auditService.log("DELETE", "PieceRechange", id, "Suppression: " + piece.getDesignation()); }
        catch (Exception e) { log.warn("audit skipped"); }
        pieceRepo.deleteById(id);
    }

    @Transactional
    public MouvementStockDTO enregistrerMouvement(Long pieceId, TypeMouvement type,
            Integer quantite, String motif, Long userId, Long interventionId, Long panneId) {
        PieceRechange piece = pieceRepo.findById(pieceId)
            .orElseThrow(() -> new ResourceNotFoundException("PieceRechange", pieceId));
        int qAvant = piece.getQuantiteStock() != null ? piece.getQuantiteStock() : 0;
        int qApres = switch (type) {
            case ENTREE, RETOUR -> qAvant + quantite;
            case AJUSTEMENT -> qAvant + quantite;
            case SORTIE, PERTE -> Math.max(0, qAvant - quantite);
            case INVENTAIRE -> quantite;
        };
        piece.setQuantiteStock(qApres);
        pieceRepo.save(piece);

        MouvementStock mvt = MouvementStock.builder()
            .piece(piece).typeMouvement(type)
            .quantite(quantite).quantiteAvant(qAvant).quantiteApres(qApres)
            .motif(motif)
            .utilisateur(userId != null ? userRepo.findById(userId).orElse(null) : null)
            .build();
        mouvementRepo.save(mvt);

        // Alerte seuil
        if (piece.getSeuilAlerteMin() != null && qApres <= piece.getSeuilAlerteMin()) {
            try {
                notificationService.notifierTousAdmins(
                    TypeNotification.STOCK_ALERTE_MIN,
                    "⚠️ Stock bas: " + piece.getDesignation(),
                    "Stock actuel: " + qApres + " (seuil min: " + piece.getSeuilAlerteMin() + ")"
                );
            } catch (Exception e) { log.warn("notification skipped"); }
        }
        try { auditService.log("MOUVEMENT_STOCK", "PieceRechange", pieceId,
            type + ": " + quantite + " → " + qAvant + " → " + qApres); }
        catch (Exception e) { log.warn("audit skipped"); }

        return toMouvementDTO(mvt);
    }

    @Transactional(readOnly = true)
    public List<MouvementStockDTO> getHistorique(Long pieceId) {
        return mouvementRepo.findByPieceIdOrderByCreatedAtDesc(pieceId)
            .stream().map(this::toMouvementDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PieceRechangeDTO> getPiecesEnAlerte() {
        return pieceRepo.findPiecesEnAlerte().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PieceRechangeDTO> getPiecesEnRupture() {
        return pieceRepo.findPiecesEnRupture().stream().map(this::toDTO).collect(Collectors.toList());
    }

    private PieceRechangeDTO toDTO(PieceRechange p) {
        PieceRechangeDTO dto = new PieceRechangeDTO();
        dto.setId(p.getId()); dto.setReference(p.getReference()); dto.setDesignation(p.getDesignation());
        dto.setCategorie(p.getCategorie()); dto.setMarque(p.getMarque()); dto.setFournisseur(p.getFournisseur());
        dto.setUnite(p.getUnite()); dto.setQuantiteStock(p.getQuantiteStock());
        dto.setSeuilAlerteMin(p.getSeuilAlerteMin()); dto.setSeuilAlerteMax(p.getSeuilAlerteMax());
        dto.setQuantiteCommandeOptimale(p.getQuantiteCommandeOptimale()); dto.setPrixUnitaire(p.getPrixUnitaire());
        dto.setEmplacement(p.getEmplacement()); dto.setDescription(p.getDescription()); dto.setCreatedAt(p.getCreatedAt());
        int qty = p.getQuantiteStock() != null ? p.getQuantiteStock() : 0;
        dto.setEnRupture(qty == 0);
        dto.setEnAlerte(p.getSeuilAlerteMin() != null && qty <= p.getSeuilAlerteMin());
        return dto;
    }

    private PieceRechange fromDTO(PieceRechangeDTO dto) {
        return PieceRechange.builder()
            .reference(dto.getReference()).designation(dto.getDesignation())
            .categorie(dto.getCategorie()).marque(dto.getMarque()).fournisseur(dto.getFournisseur())
            .unite(dto.getUnite()).quantiteStock(dto.getQuantiteStock() != null ? dto.getQuantiteStock() : 0)
            .seuilAlerteMin(dto.getSeuilAlerteMin()).seuilAlerteMax(dto.getSeuilAlerteMax())
            .quantiteCommandeOptimale(dto.getQuantiteCommandeOptimale())
            .prixUnitaire(dto.getPrixUnitaire()).emplacement(dto.getEmplacement()).description(dto.getDescription())
            .build();
    }

    private MouvementStockDTO toMouvementDTO(MouvementStock m) {
        MouvementStockDTO dto = new MouvementStockDTO();
        dto.setId(m.getId());
        // Access piece safely (same transaction)
        dto.setPieceId(m.getPiece().getId());
        dto.setPieceDesignation(m.getPiece().getDesignation());
        dto.setPieceReference(m.getPiece().getReference());
        dto.setTypeMouvement(m.getTypeMouvement());
        dto.setQuantite(m.getQuantite()); dto.setQuantiteAvant(m.getQuantiteAvant()); dto.setQuantiteApres(m.getQuantiteApres());
        dto.setMotif(m.getMotif()); dto.setReferenceDocument(m.getReferenceDocument());
        if (m.getUtilisateur() != null) {
            dto.setUtilisateurId(m.getUtilisateur().getId());
            dto.setUtilisateurNom(m.getUtilisateur().getNomComplet());
        }
        if (m.getIntervention() != null) dto.setInterventionId(m.getIntervention().getId());
        if (m.getPanne() != null) dto.setPanneId(m.getPanne().getId());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
