package com.gmpp.service;

import com.gmpp.dto.UtilisateurDTO;
import com.gmpp.entity.Utilisateur;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service @Transactional
public class UtilisateurService {
    private final UtilisateurRepository repo;
    private final PasswordEncoder       encoder;

    public UtilisateurService(UtilisateurRepository repo, PasswordEncoder encoder) {
        this.repo = repo; this.encoder = encoder;
    }

    public List<UtilisateurDTO> findAll()         { return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList()); }
    public UtilisateurDTO       findById(Long id)  { return toDTO(get(id)); }

    public UtilisateurDTO create(UtilisateurDTO dto) {
        if (repo.existsByEmail(dto.getEmail()))
            throw new IllegalArgumentException("Email déjà utilisé : " + dto.getEmail());
        if (repo.existsByMatricule(dto.getMatricule()))
            throw new IllegalArgumentException("Matricule déjà utilisé : " + dto.getMatricule());
        Utilisateur u = toEntity(dto);
        u.setMotDePasse(encoder.encode(dto.getMotDePasse()));
        return toDTO(repo.save(u));
    }

    public UtilisateurDTO update(Long id, UtilisateurDTO dto) {
        Utilisateur u = get(id);
        u.setNomComplet(dto.getNomComplet());
        u.setRole(dto.getRole());
        u.setSpecialites(dto.getSpecialites() != null ? dto.getSpecialites() : new ArrayList<>());
        u.setCertifications(dto.getCertifications() != null ? dto.getCertifications() : new ArrayList<>());
        u.setActif(dto.isActif());
        if (dto.getMotDePasse() != null && !dto.getMotDePasse().isBlank())
            u.setMotDePasse(encoder.encode(dto.getMotDePasse()));
        return toDTO(repo.save(u));
    }

    public void delete(Long id) { if (!repo.existsById(id)) throw new ResourceNotFoundException("Utilisateur", id); repo.deleteById(id); }

    private Utilisateur get(Long id) { return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id)); }

    public UtilisateurDTO toDTO(Utilisateur u) {
        UtilisateurDTO d = UtilisateurDTO.builder()
            .id(u.getId()).nomComplet(u.getNomComplet()).matricule(u.getMatricule())
            .email(u.getEmail()).role(u.getRole())
            .specialites(u.getSpecialites()).certifications(u.getCertifications()).actif(u.isActif()).build();
        if (u.getInterventions() != null) d.setNombreInterventions(u.getInterventions().size());
        return d;
    }

    private Utilisateur toEntity(UtilisateurDTO d) {
        return Utilisateur.builder()
            .nomComplet(d.getNomComplet()).matricule(d.getMatricule()).email(d.getEmail())
            .role(d.getRole())
            .specialites(d.getSpecialites() != null ? d.getSpecialites() : new ArrayList<>())
            .certifications(d.getCertifications() != null ? d.getCertifications() : new ArrayList<>())
            .actif(true).build();
    }
}
