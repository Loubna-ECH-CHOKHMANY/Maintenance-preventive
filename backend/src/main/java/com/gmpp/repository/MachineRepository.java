package com.gmpp.repository;
import com.gmpp.entity.Machine;
import com.gmpp.enums.StatutMachine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByStatut(StatutMachine statut);
    boolean existsByNumeroSerie(String numeroSerie);
    @Query("SELECT COUNT(m) FROM Machine m WHERE m.statut = 'EN_SERVICE'") long countEnService();
    @Query("SELECT COUNT(m) FROM Machine m WHERE m.statut = 'EN_MAINTENANCE'") long countEnMaintenance();
}
