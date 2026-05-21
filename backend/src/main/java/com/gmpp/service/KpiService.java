package com.gmpp.service;

import com.gmpp.dto.KpiDTO;
import com.gmpp.entity.Machine;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.enums.StatutPanne;
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
public class KpiService {
    private final MachineRepository machineRepository;
    private final InterventionRepository interventionRepository;
    private final PanneCorrectifRepository panneRepository;

    /**
     * MTBF = heures disponibles / nombre de pannes
     */
    private double calculerMTBF(Long machineId, LocalDateTime debut, LocalDateTime fin) {
        try {
            long nbPannes = panneRepository.findByMachineId(machineId).stream()
                .filter(p -> p.getStatut() == StatutPanne.RESOLUE || p.getStatut() == StatutPanne.VALIDEE)
                .filter(p -> p.getDateDeclaration() != null
                    && p.getDateDeclaration().isAfter(debut)
                    && p.getDateDeclaration().isBefore(fin))
                .count();
            if (nbPannes == 0) return 0;
            long heuresPeriode = Math.max(1, ChronoUnit.HOURS.between(debut, fin));
            long minutesMaintenance = interventionRepository.findByMachineId(machineId).stream()
                .filter(i -> i.getStatut() == StatutIntervention.TERMINEE && i.getDureeEffectiveMinutes() != null)
                .mapToLong(i -> i.getDureeEffectiveMinutes())
                .sum();
            long heuresFonctionnement = heuresPeriode - (minutesMaintenance / 60);
            return heuresFonctionnement > 0 ? Math.max(0, (double) heuresFonctionnement / nbPannes) : 0;
        } catch (Exception e) {
            log.debug("MTBF calc error for machine {}: {}", machineId, e.getMessage());
            return 0;
        }
    }

    /**
     * MTTR = moyenne des temps de réparation en heures
     */
    private double calculerMTTR(Long machineId, LocalDateTime debut, LocalDateTime fin) {
        try {
            Double avg = panneRepository.avgTempsReparationByMachine(machineId);
            return avg != null ? avg / 60.0 : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private double calculerDisponibilite(Long machineId, LocalDateTime debut, LocalDateTime fin) {
        try {
            long heuresPeriode = Math.max(1, ChronoUnit.HOURS.between(debut, fin));
            long minutesPanne = panneRepository.findByMachineId(machineId).stream()
                .filter(p -> p.getDateDeclaration() != null
                    && p.getDateDeclaration().isAfter(debut)
                    && p.getTempsPanneMinutes() != null)
                .mapToLong(p -> p.getTempsPanneMinutes())
                .sum();
            double heuresPanne = minutesPanne / 60.0;
            return Math.max(0, Math.min(100.0, ((heuresPeriode - heuresPanne) / heuresPeriode) * 100.0));
        } catch (Exception e) {
            return 100.0;
        }
    }

    private double calculerPerformance(Long machineId, LocalDateTime debut, LocalDateTime fin) {
        try {
            long totalPlanifiees = interventionRepository.findByMachineId(machineId).stream()
                .filter(i -> i.getDatePlanifiee() != null
                    && i.getDatePlanifiee().isAfter(debut)
                    && i.getDatePlanifiee().isBefore(fin))
                .count();
            if (totalPlanifiees == 0) return 100.0;
            long realisees = interventionRepository.findByMachineId(machineId).stream()
                .filter(i -> i.getDatePlanifiee() != null
                    && i.getDatePlanifiee().isAfter(debut)
                    && i.getDatePlanifiee().isBefore(fin)
                    && i.getStatut() == StatutIntervention.TERMINEE)
                .count();
            return Math.min(100.0, (double) realisees / totalPlanifiees * 100.0);
        } catch (Exception e) {
            return 100.0;
        }
    }

    @Transactional(readOnly = true)
    public KpiDTO getKpiMachine(Long machineId, String periode) {
        LocalDateTime fin   = LocalDateTime.now();
        LocalDateTime debut = switch (periode != null ? periode : "mois") {
            case "semaine"   -> fin.minusWeeks(1);
            case "trimestre" -> fin.minusMonths(3);
            case "annee"     -> fin.minusYears(1);
            default          -> fin.minusMonths(1);
        };

        Machine machine = machineRepository.findById(machineId)
            .orElseThrow(() -> new RuntimeException("Machine non trouvée: " + machineId));

        long nbPannes     = panneRepository.findByMachineId(machineId).size();
        double dispo      = calculerDisponibilite(machineId, debut, fin);
        double perf       = calculerPerformance(machineId, debut, fin);
        double qualite    = 95.0;
        double oee        = (dispo / 100.0) * (perf / 100.0) * (qualite / 100.0) * 100.0;
        double mtbf       = calculerMTBF(machineId, debut, fin);
        double mttr       = calculerMTTR(machineId, debut, fin);

        long totalPlanifiees = interventionRepository.findByMachineId(machineId).stream()
            .filter(i -> i.getDatePlanifiee() != null
                && i.getDatePlanifiee().isAfter(debut)
                && i.getDatePlanifiee().isBefore(fin))
            .count();
        long realisees = interventionRepository.findByMachineId(machineId).stream()
            .filter(i -> i.getDatePlanifiee() != null
                && i.getDatePlanifiee().isAfter(debut)
                && i.getDatePlanifiee().isBefore(fin)
                && i.getStatut() == StatutIntervention.TERMINEE)
            .count();

        double tauxPlanning = totalPlanifiees > 0
            ? Math.round((double) realisees / totalPlanifiees * 1000.0) / 10.0
            : 100.0;

        return KpiDTO.builder()
            .machineId(machineId)
            .machineNom(machine.getNom())
            .mtbf(round1(mtbf))
            .mttr(round1(mttr))
            .oee(round1(oee))
            .trs(round1(oee))
            .disponibilite(round1(dispo))
            .performance(round1(perf))
            .qualite(qualite)
            .nombrePannes((int) nbPannes)
            .interventionsRealisees((int) realisees)
            .tauxRealisationPlanning(tauxPlanning)
            .periode(periode != null ? periode : "mois")
            .build();
    }

    @Transactional(readOnly = true)
    public List<KpiDTO> getKpiToutes(String periode) {
        return machineRepository.findAll().stream()
            .map(m -> {
                try { return getKpiMachine(m.getId(), periode); }
                catch (Exception e) {
                    log.warn("KPI calc failed for machine {}: {}", m.getId(), e.getMessage());
                    return null;
                }
            })
            .filter(k -> k != null)
            .collect(Collectors.toList());
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
