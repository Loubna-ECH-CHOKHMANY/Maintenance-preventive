package com.gmpp.service;

import com.gmpp.dto.MachineDTO;
import com.gmpp.entity.Machine;
import com.gmpp.enums.StatutMachine;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.repository.MachineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @Transactional
public class MachineService {
    private final MachineRepository repo;
    public MachineService(MachineRepository repo) { this.repo = repo; }

    public List<MachineDTO> findAll()       { return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList()); }
    public MachineDTO findById(Long id)     { return toDTO(get(id)); }
    public List<MachineDTO> findByStatut(StatutMachine s) { return repo.findByStatut(s).stream().map(this::toDTO).collect(Collectors.toList()); }

    public MachineDTO create(MachineDTO dto) {
        if (repo.existsByNumeroSerie(dto.getNumeroSerie()))
            throw new IllegalArgumentException("Numéro de série déjà existant : " + dto.getNumeroSerie());
        return toDTO(repo.save(toEntity(dto)));
    }

    public MachineDTO update(Long id, MachineDTO dto) {
        Machine m = get(id);
        m.setNom(dto.getNom());           m.setTypeMachine(dto.getTypeMachine());
        m.setMarque(dto.getMarque());     m.setModele(dto.getModele());
        m.setAtelier(dto.getAtelier());   m.setZone(dto.getZone());
        m.setLigneProduction(dto.getLigneProduction());
        m.setStatut(dto.getStatut());     m.setCompteurHoraire(dto.getCompteurHoraire());
        m.setAnneeFabrication(dto.getAnneeFabrication());
        m.setDateMiseEnService(dto.getDateMiseEnService());
        return toDTO(repo.save(m));
    }

    public void delete(Long id) { if (!repo.existsById(id)) throw new ResourceNotFoundException("Machine", id); repo.deleteById(id); }

    public MachineDTO updateCompteur(Long id, Long heures) {
        Machine m = get(id);
        m.setCompteurHoraire(heures);
        return toDTO(repo.save(m));
    }

    private Machine get(Long id) { return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Machine", id)); }

    public MachineDTO toDTO(Machine m) {
        MachineDTO d = MachineDTO.builder()
            .id(m.getId()).nom(m.getNom()).typeMachine(m.getTypeMachine())
            .marque(m.getMarque()).modele(m.getModele()).numeroSerie(m.getNumeroSerie())
            .anneeFabrication(m.getAnneeFabrication()).dateMiseEnService(m.getDateMiseEnService())
            .atelier(m.getAtelier()).zone(m.getZone()).ligneProduction(m.getLigneProduction())
            .statut(m.getStatut()).compteurHoraire(m.getCompteurHoraire()).build();
        if (m.getPointsMaintenance() != null) d.setNombrePointsMaintenance(m.getPointsMaintenance().size());
        if (m.getInterventions()     != null) d.setNombreInterventions(m.getInterventions().size());
        return d;
    }

    private Machine toEntity(MachineDTO d) {
        return Machine.builder()
            .nom(d.getNom()).typeMachine(d.getTypeMachine()).marque(d.getMarque())
            .modele(d.getModele()).numeroSerie(d.getNumeroSerie())
            .anneeFabrication(d.getAnneeFabrication()).dateMiseEnService(d.getDateMiseEnService())
            .atelier(d.getAtelier()).zone(d.getZone()).ligneProduction(d.getLigneProduction())
            .statut(d.getStatut()).compteurHoraire(d.getCompteurHoraire() != null ? d.getCompteurHoraire() : 0L)
            .build();
    }
}
