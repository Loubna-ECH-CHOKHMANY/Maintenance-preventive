package com.gmpp.service;

import com.gmpp.dto.ConfirmerRequest;
import com.gmpp.dto.InterventionDTO;
import com.gmpp.entity.*;
import com.gmpp.enums.RoleUtilisateur;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InterventionService {

    private final InterventionRepository     repo;
    private final MachineRepository          machineRepo;
    private final PointMaintenanceRepository pmRepo;
    private final UtilisateurRepository      userRepo;
    private final PointMaintenanceService    pmService;

    public InterventionService(InterventionRepository repo, MachineRepository machineRepo,
                               PointMaintenanceRepository pmRepo, UtilisateurRepository userRepo,
                               PointMaintenanceService pmService) {
        this.repo = repo;
        this.machineRepo = machineRepo;
        this.pmRepo = pmRepo;
        this.userRepo = userRepo;
        this.pmService = pmService;
    }

    // ── Méthodes publiques exposées au contrôleur ──────────────────────────

    /**
     * Retourne les interventions visibles par l'utilisateur courant.
     * TECHNICIEN → uniquement ses interventions.
     * Autres rôles → toutes les interventions.
     */
    public List<InterventionDTO> findAllForUser(UserDetails principal) {
        Utilisateur current = resolveUser(principal);
        if (current.getRole() == RoleUtilisateur.TECHNICIEN) {
            return repo.findByTechnicienId(current.getId())
                       .stream().map(this::toDTO).collect(Collectors.toList());
        }
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Retourne une intervention par ID.
     * TECHNICIEN → interdit si ce n'est pas la sienne.
     */
    public InterventionDTO findByIdForUser(Long id, UserDetails principal) {
        Intervention i = get(id);
        checkTechnicienOwnership(i, principal);
        return toDTO(i);
    }

    /** Créer une intervention (contrôleur vérifie les rôles via @PreAuthorize). */
    public InterventionDTO create(InterventionDTO dto) {
        Intervention i = buildFrom(dto);
        i.setStatut(StatutIntervention.PLANIFIEE);
        return toDTO(repo.save(i));
    }

    /**
     * Mise à jour selon le rôle :
     * - TECHNICIEN : uniquement observations/etatConstate/dureeEffective, et seulement sur ses interventions.
     * - CHEF_EQUIPE : datePlanifiee + technicien assigné.
     * - ADMIN/RESPONSABLE : tout.
     */
    public InterventionDTO updateForUser(Long id, InterventionDTO dto, UserDetails principal) {
        Intervention i = get(id);
        Utilisateur current = resolveUser(principal);

        switch (current.getRole()) {
            case TECHNICIEN -> {
                checkTechnicienOwnership(i, principal);
                // Le technicien ne met à jour que les champs d'exécution
                i.setObservationsTechnicien(dto.getObservationsTechnicien());
                i.setEtatConstate(dto.getEtatConstate());
                i.setDureeEffectiveMinutes(dto.getDureeEffectiveMinutes());
                if (dto.getStatut() != null) i.setStatut(dto.getStatut());
            }
            case CHEF_EQUIPE -> {
                i.setDatePlanifiee(dto.getDatePlanifiee());
                if (dto.getTechnicienId() != null)
                    i.setTechnicien(userRepo.findById(dto.getTechnicienId()).orElse(null));
                if (dto.getStatut() != null) i.setStatut(dto.getStatut());
            }
            default -> {
                // ADMIN / RESPONSABLE_MAINTENANCE : accès complet
                i.setDatePlanifiee(dto.getDatePlanifiee());
                if (dto.getStatut() != null) i.setStatut(dto.getStatut());
                i.setObservationsTechnicien(dto.getObservationsTechnicien());
                i.setEtatConstate(dto.getEtatConstate());
                i.setDureeEffectiveMinutes(dto.getDureeEffectiveMinutes());
                if (dto.getTechnicienId() != null)
                    i.setTechnicien(userRepo.findById(dto.getTechnicienId()).orElse(null));
            }
        }
        return toDTO(repo.save(i));
    }

    /**
     * Confirmer l'exécution.
     * TECHNICIEN : uniquement ses interventions.
     * Autres rôles autorisés : peuvent forcer la confirmation.
     */
    public InterventionDTO confirmerForUser(Long id, ConfirmerRequest req, UserDetails principal) {
        Intervention i = get(id);
        Utilisateur current = resolveUser(principal);
        if (current.getRole() == RoleUtilisateur.TECHNICIEN) {
            checkTechnicienOwnership(i, principal);
        }
        i.setConfirmeParTechnicien(true);
        i.setStatut(StatutIntervention.TERMINEE);
        i.setDateReelleExecution(LocalDateTime.now());
        i.setObservationsTechnicien(req.getObservations());
        i.setEtatConstate(req.getEtatConstate());
        if (req.getDureeMinutes() != null) i.setDureeEffectiveMinutes(req.getDureeMinutes());
        if (i.getPointMaintenance() != null)
            pmService.mettreAJourProchainDate(i.getPointMaintenance().getId());
        return toDTO(repo.save(i));
    }

    public InterventionDTO valider(Long id) {
        Intervention i = get(id);
        i.setValideParResponsable(true);
        return toDTO(repo.save(i));
    }

    public InterventionDTO annuler(Long id, String justification) {
        Intervention i = get(id);
        i.setStatut(StatutIntervention.ANNULEE);
        i.setJustificationAnnulation(justification);
        return toDTO(repo.save(i));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Intervention", id);
        repo.deleteById(id);
    }

    public List<InterventionDTO> findByMachine(Long id) {
        return repo.findByMachineId(id).stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Interventions par technicien.
     * TECHNICIEN ne peut voir que les siennes.
     */
    public List<InterventionDTO> findByTechnicienForUser(Long techId, UserDetails principal) {
        Utilisateur current = resolveUser(principal);
        if (current.getRole() == RoleUtilisateur.TECHNICIEN
                && !current.getId().equals(techId)) {
            throw new AccessDeniedException("Accès refusé : vous ne pouvez consulter que vos propres interventions.");
        }
        return repo.findByTechnicienId(techId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<InterventionDTO> findByPeriode(LocalDateTime s, LocalDateTime e) {
        return repo.findByPeriode(s, e).stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Méthodes privées utilitaires ───────────────────────────────────────

    private Intervention get(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Intervention", id));
    }

    private Utilisateur resolveUser(UserDetails principal) {
        return userRepo.findByEmail(principal.getUsername())
                       .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", 0L));
    }

    /** Lance AccessDeniedException si un TECHNICIEN tente d'accéder à une intervention qui n'est pas la sienne. */
    private void checkTechnicienOwnership(Intervention i, UserDetails principal) {
        Utilisateur current = resolveUser(principal);
        if (current.getRole() == RoleUtilisateur.TECHNICIEN) {
            boolean isOwner = i.getTechnicien() != null
                    && i.getTechnicien().getId().equals(current.getId());
            if (!isOwner) {
                throw new AccessDeniedException("Accès refusé : cette intervention ne vous appartient pas.");
            }
        }
    }

    private Intervention buildFrom(InterventionDTO dto) {
        Machine machine = machineRepo.findById(dto.getMachineId())
            .orElseThrow(() -> new ResourceNotFoundException("Machine", dto.getMachineId()));
        Intervention i = Intervention.builder()
            .machine(machine)
            .datePlanifiee(dto.getDatePlanifiee())
            .statut(dto.getStatut() != null ? dto.getStatut() : StatutIntervention.PLANIFIEE)
            .build();
        if (dto.getPointMaintenanceId() != null)
            i.setPointMaintenance(pmRepo.findById(dto.getPointMaintenanceId()).orElse(null));
        if (dto.getTechnicienId() != null)
            i.setTechnicien(userRepo.findById(dto.getTechnicienId()).orElse(null));
        return i;
    }

    public InterventionDTO toDTO(Intervention i) {
        InterventionDTO d = new InterventionDTO();
        d.setId(i.getId());
        d.setMachineId(i.getMachine().getId());
        d.setMachineNom(i.getMachine().getNom());
        if (i.getPointMaintenance() != null) {
            d.setPointMaintenanceId(i.getPointMaintenance().getId());
            d.setTypeOperation(i.getPointMaintenance().getTypeOperation().name());
            d.setPointMaintenanceNom(i.getPointMaintenance().getTypeOperation().name() + (i.getPointMaintenance().getLocalisationSurMachine() != null ? " - " + i.getPointMaintenance().getLocalisationSurMachine() : ""));
        }
        if (i.getTechnicien() != null) {
            d.setTechnicienId(i.getTechnicien().getId());
            d.setTechnicienNom(i.getTechnicien().getNomComplet());
        }
        d.setDatePlanifiee(i.getDatePlanifiee());
        d.setDateReelleExecution(i.getDateReelleExecution());
        d.setDureeEffectiveMinutes(i.getDureeEffectiveMinutes());
        d.setStatut(i.getStatut());
        d.setObservationsTechnicien(i.getObservationsTechnicien());
        d.setEtatConstate(i.getEtatConstate());
        d.setConfirmeParTechnicien(i.isConfirmeParTechnicien());
        d.setValideParResponsable(i.isValideParResponsable());
        d.setJustificationAnnulation(i.getJustificationAnnulation());
        return d;
    }
}
