package com.gmpp.service;

import com.gmpp.dto.PanneCorrectifDTO;
import com.gmpp.entity.*;
import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.StatutPanne;
import com.gmpp.enums.TypeNotification;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class PanneCorrectifService {
    private final PanneCorrectifRepository panneRepo;
    private final MachineRepository machineRepo;
    private final UtilisateurRepository userRepo;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<PanneCorrectifDTO> getAll() {
        return panneRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PanneCorrectifDTO getById(Long id) {
        return toDTO(panneRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PanneCorrectif", id)));
    }

    @Transactional(readOnly = true)
    public List<PanneCorrectifDTO> getByMachine(Long machineId) {
        return panneRepo.findByMachineId(machineId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public PanneCorrectifDTO declarer(PanneCorrectifDTO dto) {
        Machine machine = machineRepo.findById(dto.getMachineId())
            .orElseThrow(() -> new ResourceNotFoundException("Machine", dto.getMachineId()));
        PanneCorrectif panne = PanneCorrectif.builder()
            .machine(machine).titre(dto.getTitre()).description(dto.getDescription())
            .urgence(dto.getUrgence()).statut(StatutPanne.DECLAREE)
            .dateDeclaration(LocalDateTime.now()).build();
        if (dto.getTechnicienId() != null) {
            panne.setTechnicien(userRepo.findById(dto.getTechnicienId()).orElse(null));
        }
        machine.setStatut(StatutMachine.EN_REPARATION);
        machineRepo.save(machine);
        panne = panneRepo.save(panne);

        try {
            notificationService.notifierTousAdmins(TypeNotification.PANNE_DECLAREE,
                "🚨 Panne: " + machine.getNom(), dto.getTitre() + " — Urgence: " + dto.getUrgence());
        } catch (Exception e) { log.warn("notification skipped"); }
        try { auditService.log("DECLARE_PANNE", "PanneCorrectif", panne.getId(), "Machine: " + machine.getNom()); }
        catch (Exception e) { log.warn("audit skipped"); }
        return toDTO(panne);
    }

    @Transactional
    public PanneCorrectifDTO resoudre(Long id, PanneCorrectifDTO dto) {
        PanneCorrectif panne = panneRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PanneCorrectif", id));
        panne.setStatut(StatutPanne.RESOLUE);
        panne.setDateFinIntervention(LocalDateTime.now());
        panne.setCausesIdentifiees(dto.getCausesIdentifiees());
        panne.setActionsCorrectivesEffectuees(dto.getActionsCorrectivesEffectuees());
        panne.setPieceUtilisees(dto.getPieceUtilisees());
        panne.setCoutReparation(dto.getCoutReparation());
        panne.setTempsReparationMinutes(dto.getTempsReparationMinutes());
        panne.setSignatureTechnicien(dto.getSignatureTechnicien());
        if (dto.getDateDebutIntervention() != null) panne.setDateDebutIntervention(dto.getDateDebutIntervention());
        if (panne.getDateDeclaration() != null) {
            long minutes = ChronoUnit.MINUTES.between(panne.getDateDeclaration(), LocalDateTime.now());
            panne.setTempsPanneMinutes((int) minutes);
        }
        Machine machine = panne.getMachine();
        machine.setStatut(StatutMachine.EN_SERVICE);
        machineRepo.save(machine);
        panneRepo.save(panne);
        try { auditService.log("RESOUDRE_PANNE", "PanneCorrectif", id, "Panne résolue"); }
        catch (Exception e) { log.warn("audit skipped"); }
        return toDTO(panne);
    }

    @Transactional
    public PanneCorrectifDTO valider(Long id) {
        PanneCorrectif panne = panneRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PanneCorrectif", id));
        panne.setStatut(StatutPanne.VALIDEE);
        panne.setValideParResponsable(true);
        try { auditService.log("VALIDER_PANNE", "PanneCorrectif", id, "Validée"); }
        catch (Exception e) { log.warn("audit skipped"); }
        return toDTO(panneRepo.save(panne));
    }

    @Transactional
    public void supprimer(Long id) {
        if (!panneRepo.existsById(id)) throw new ResourceNotFoundException("PanneCorrectif", id);
        try { auditService.log("DELETE", "PanneCorrectif", id, "Suppression"); }
        catch (Exception e) { log.warn("audit skipped"); }
        panneRepo.deleteById(id);
    }

    public PanneCorrectifDTO toDTO(PanneCorrectif p) {
        PanneCorrectifDTO dto = new PanneCorrectifDTO();
        dto.setId(p.getId());
        dto.setMachineId(p.getMachine().getId());
        dto.setMachineNom(p.getMachine().getNom());
        if (p.getTechnicien() != null) {
            dto.setTechnicienId(p.getTechnicien().getId());
            dto.setTechnicienNom(p.getTechnicien().getNomComplet());
        }
        dto.setTitre(p.getTitre()); dto.setDescription(p.getDescription());
        dto.setUrgence(p.getUrgence()); dto.setStatut(p.getStatut());
        dto.setDateDeclaration(p.getDateDeclaration());
        dto.setDateDebutIntervention(p.getDateDebutIntervention());
        dto.setDateFinIntervention(p.getDateFinIntervention());
        dto.setTempsPanneMinutes(p.getTempsPanneMinutes());
        dto.setTempsReparationMinutes(p.getTempsReparationMinutes());
        dto.setCausesIdentifiees(p.getCausesIdentifiees());
        dto.setActionsCorrectivesEffectuees(p.getActionsCorrectivesEffectuees());
        dto.setPieceUtilisees(p.getPieceUtilisees());
        dto.setCoutReparation(p.getCoutReparation());
        dto.setPhotos(p.getPhotos());
        dto.setSignatureTechnicien(p.getSignatureTechnicien());
        dto.setValideParResponsable(p.isValideParResponsable());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
