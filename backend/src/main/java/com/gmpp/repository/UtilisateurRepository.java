package com.gmpp.repository;

import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.RoleUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByMatricule(String matricule);
    List<Utilisateur> findByRole(RoleUtilisateur role);
    List<Utilisateur> findByActifTrue();
}
