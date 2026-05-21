package com.gmpp.scheduler;

import com.gmpp.entity.Intervention;
import com.gmpp.entity.PointMaintenance;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.enums.TypeNotification;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.PointMaintenanceRepository;
import com.gmpp.service.NotificationService;
import com.gmpp.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component @RequiredArgsConstructor @Slf4j
public class MaintenanceScheduler {
    private final InterventionRepository interventionRepo;
    private final PointMaintenanceRepository pointRepo;
    private final NotificationService notificationService;
    private final AuditService auditService;

    /** Détecte les interventions en retard — toutes les 30 minutes */
    @Scheduled(fixedDelay = 1800000, initialDelay = 60000)
    @Transactional
    public void detecterInterventionsEnRetard() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Intervention> retards = interventionRepo.findAll().stream()
                .filter(i -> i.getStatut() == StatutIntervention.PLANIFIEE
                    && i.getDatePlanifiee() != null
                    && i.getDatePlanifiee().isBefore(now))
                .toList();
            if (!retards.isEmpty()) {
                for (Intervention i : retards) {
                    i.setStatut(StatutIntervention.EN_RETARD);
                    interventionRepo.save(i);
                }
                log.info("Scheduler: {} interventions passées EN_RETARD", retards.size());
                try {
                    notificationService.notifierTousAdmins(TypeNotification.INTERVENTION_EN_RETARD,
                        "⚠️ " + retards.size() + " intervention(s) en retard",
                        "Des interventions planifiées n'ont pas été réalisées dans les délais.");
                } catch (Exception e) { log.warn("notification skipped: {}", e.getMessage()); }
            }
        } catch (Exception e) {
            log.error("Erreur scheduler retards: {}", e.getMessage());
        }
    }

    /** Alertes J-7, J-3, J-1 — quotidien à 8h00 */
    @Scheduled(cron = "0 0 8 * * *", zone = "Africa/Casablanca")
    @Transactional(readOnly = true)
    public void envoyerAlertesProchaines() {
        try {
            LocalDateTime now = LocalDateTime.now();
            int[] joursAlerte = {7, 3, 1};
            for (int j : joursAlerte) {
                LocalDateTime debut = now.plusDays(j - 1);
                LocalDateTime fin = now.plusDays(j);
                List<Intervention> prochaines = interventionRepo.findAll().stream()
                    .filter(i -> i.getStatut() == StatutIntervention.PLANIFIEE
                        && i.getDatePlanifiee() != null
                        && i.getDatePlanifiee().isAfter(debut)
                        && i.getDatePlanifiee().isBefore(fin))
                    .toList();
                for (Intervention i : prochaines) {
                    if (i.getTechnicien() != null) {
                        try {
                            notificationService.notifier(i.getTechnicien().getId(),
                                TypeNotification.INTERVENTION_PLANIFIEE,
                                "📅 Intervention dans " + j + " jour(s)",
                                "Machine: " + i.getMachine().getNom(),
                                "/interventions/" + i.getId(), i.getId(), "Intervention");
                        } catch (Exception e) { log.warn("notification skipped"); }
                    }
                }
            }
            log.info("Alertes prochaines envoyées");
        } catch (Exception e) {
            log.error("Erreur scheduler alertes: {}", e.getMessage());
        }
    }

    /** Génération auto des interventions planifiées — quotidien à 6h00 */
    @Scheduled(cron = "0 0 6 * * *", zone = "Africa/Casablanca")
    @Transactional
    public void genererInterventionsPlanifiees() {
        try {
            List<PointMaintenance> points = pointRepo.findAll();
            int generated = 0;
            for (PointMaintenance point : points) {
                if (point.getProchaineDatePrevue() == null) continue;
                LocalDateTime prochaine = point.getProchaineDatePrevue().atStartOfDay();
                if (!prochaine.isAfter(LocalDateTime.now().plusDays(7))) {
                    boolean existe = interventionRepo.findAll().stream()
                        .anyMatch(i -> i.getPointMaintenance() != null
                            && i.getPointMaintenance().getId().equals(point.getId())
                            && i.getStatut() == StatutIntervention.PLANIFIEE
                            && i.getDatePlanifiee() != null
                            && i.getDatePlanifiee().toLocalDate().equals(prochaine.toLocalDate()));
                    if (!existe) {
                        Intervention inv = Intervention.builder()
                            .machine(point.getMachine())
                            .pointMaintenance(point)
                            .datePlanifiee(prochaine)
                            .statut(StatutIntervention.PLANIFIEE)
                            .build();
                        interventionRepo.save(inv);
                        generated++;
                    }
                }
            }
            if (generated > 0) log.info("Scheduler: {} interventions auto-générées", generated);
        } catch (Exception e) {
            log.error("Erreur scheduler génération: {}", e.getMessage());
        }
    }
}
