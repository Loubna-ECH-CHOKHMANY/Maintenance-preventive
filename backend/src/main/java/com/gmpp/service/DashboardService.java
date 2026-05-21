package com.gmpp.service;

import com.gmpp.dto.DashboardDTO;
import com.gmpp.dto.InterventionDTO;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.enums.StatutMachine;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.MachineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final InterventionRepository interventionRepo;
    private final MachineRepository      machineRepo;
    private final InterventionService    interventionService;

    public DashboardService(InterventionRepository interventionRepo, MachineRepository machineRepo,
                            InterventionService interventionService) {
        this.interventionRepo    = interventionRepo;
        this.machineRepo         = machineRepo;
        this.interventionService = interventionService;
    }

    public DashboardDTO getDashboard() {
        LocalDateTime now   = LocalDateTime.now();
        LocalDateTime debut = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime fin   = now.plusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0).minusNanos(1);

        long planifiees = interventionRepo.countPlanifiees(debut, fin);
        long terminees  = interventionRepo.countTerminees(debut, fin);
        long enCours    = interventionRepo.findByStatut(StatutIntervention.EN_COURS).size();
        double taux     = planifiees > 0 ? Math.round((double) terminees / planifiees * 1000.0) / 10.0 : 0.0;

        // Machines par statut
        long enService    = machineRepo.countEnService();
        long enMaint      = machineRepo.countEnMaintenance();
        long horsService  = machineRepo.findByStatut(StatutMachine.HORS_SERVICE).size();
        long enReparation = machineRepo.findByStatut(StatutMachine.EN_REPARATION).size();

        List<InterventionDTO> prochaines = interventionRepo.findByPeriode(now, now.plusDays(7))
            .stream()
            .filter(i -> i.getStatut() == StatutIntervention.PLANIFIEE)
            .limit(5)
            .map(interventionService::toDTO)
            .collect(Collectors.toList());

        List<InterventionDTO> enRetardList = interventionRepo.findByStatut(StatutIntervention.PLANIFIEE)
            .stream()
            .filter(i -> i.getDatePlanifiee() != null && i.getDatePlanifiee().isBefore(now))
            .limit(8)
            .map(interventionService::toDTO)
            .collect(Collectors.toList());

        return DashboardDTO.builder()
            .totalMachines(machineRepo.count())
            .machinesEnService(enService)
            .machinesEnMaintenance(enMaint)
            .machinesHorsService(horsService + enReparation)
            .totalInterventions(interventionRepo.count())
            .interventionsPlanifiees(planifiees)
            .interventionsTerminees(terminees)
            .interventionsEnRetard(interventionRepo.countEnRetard(now))
            .interventionsEnCours(enCours)
            .tauxRealisationPlanning(taux)
            .tempsMoyenIntervention(Optional.ofNullable(interventionRepo.avgDuree()).orElse(0.0))
            .prochainesInterventions(prochaines)
            .interventionsEnRetardList(enRetardList)
            .build();
    }
}
