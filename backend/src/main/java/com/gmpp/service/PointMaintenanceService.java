package com.gmpp.service;

import com.gmpp.dto.PointMaintenanceDTO;
import com.gmpp.entity.Machine;
import com.gmpp.entity.PointMaintenance;
import com.gmpp.enums.FrequenceIntervention;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.repository.MachineRepository;
import com.gmpp.repository.PointMaintenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service @Transactional
public class PointMaintenanceService {
    private final PointMaintenanceRepository repo;
    private final MachineRepository machineRepo;

    public PointMaintenanceService(PointMaintenanceRepository repo, MachineRepository machineRepo) {
        this.repo = repo; this.machineRepo = machineRepo;
    }

    public List<PointMaintenanceDTO> findAll()              { return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList()); }
    public PointMaintenanceDTO       findById(Long id)      { return toDTO(get(id)); }
    public List<PointMaintenanceDTO> findByMachine(Long id) { return repo.findByMachineId(id).stream().map(this::toDTO).collect(Collectors.toList()); }

    public PointMaintenanceDTO create(PointMaintenanceDTO dto) {
        Machine m = machineRepo.findById(dto.getMachineId())
            .orElseThrow(() -> new ResourceNotFoundException("Machine", dto.getMachineId()));
        PointMaintenance pm = toEntity(dto);
        pm.setMachine(m);
        pm.setProchaineDatePrevue(calculerProchaineDate(dto.getFrequence(), LocalDate.now()));
        return toDTO(repo.save(pm));
    }

    public PointMaintenanceDTO update(Long id, PointMaintenanceDTO dto) {
        PointMaintenance pm = get(id);
        pm.setTypeOperation(dto.getTypeOperation());
        pm.setDescription(dto.getDescription());
        pm.setLocalisationSurMachine(dto.getLocalisationSurMachine());
        pm.setTypeConsommable(dto.getTypeConsommable());
        pm.setReferenceConsommable(dto.getReferenceConsommable());
        pm.setQuantiteNecessaire(dto.getQuantiteNecessaire());
        pm.setUniteQuantite(dto.getUniteQuantite());
        pm.setFrequence(dto.getFrequence());
        pm.setIntervalleHeures(dto.getIntervalleHeures());
        return toDTO(repo.save(pm));
    }

    public void delete(Long id) { if (!repo.existsById(id)) throw new ResourceNotFoundException("PointMaintenance", id); repo.deleteById(id); }

    public void mettreAJourProchainDate(Long id) {
        PointMaintenance pm = get(id);
        pm.setProchaineDatePrevue(calculerProchaineDate(pm.getFrequence(), LocalDate.now()));
        repo.save(pm);
    }

    public LocalDate calculerProchaineDate(FrequenceIntervention freq, LocalDate base) {
        return switch (freq) {
            case QUOTIDIENNE    -> base.plusDays(1);
            case HEBDOMADAIRE   -> base.plusWeeks(1);
            case MENSUELLE      -> base.plusMonths(1);
            case TRIMESTRIELLE  -> base.plusMonths(3);
            case SEMESTRIELLE   -> base.plusMonths(6);
            case ANNUELLE       -> base.plusYears(1);
            default             -> base.plusMonths(1);
        };
    }

    private PointMaintenance get(Long id) { return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("PointMaintenance", id)); }

    public PointMaintenanceDTO toDTO(PointMaintenance pm) {
        return PointMaintenanceDTO.builder()
            .id(pm.getId()).typeOperation(pm.getTypeOperation()).description(pm.getDescription())
            .localisationSurMachine(pm.getLocalisationSurMachine()).typeConsommable(pm.getTypeConsommable())
            .referenceConsommable(pm.getReferenceConsommable()).quantiteNecessaire(pm.getQuantiteNecessaire())
            .uniteQuantite(pm.getUniteQuantite()).frequence(pm.getFrequence())
            .intervalleHeures(pm.getIntervalleHeures()).prochaineDatePrevue(pm.getProchaineDatePrevue())
            .machineId(pm.getMachine().getId()).machineNom(pm.getMachine().getNom())
            .build();
    }

    private PointMaintenance toEntity(PointMaintenanceDTO d) {
        return PointMaintenance.builder()
            .typeOperation(d.getTypeOperation()).description(d.getDescription())
            .localisationSurMachine(d.getLocalisationSurMachine()).typeConsommable(d.getTypeConsommable())
            .referenceConsommable(d.getReferenceConsommable()).quantiteNecessaire(d.getQuantiteNecessaire())
            .uniteQuantite(d.getUniteQuantite()).frequence(d.getFrequence())
            .intervalleHeures(d.getIntervalleHeures()).build();
    }
}
