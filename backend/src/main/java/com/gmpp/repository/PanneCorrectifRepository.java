package com.gmpp.repository;
import com.gmpp.entity.PanneCorrectif;
import com.gmpp.enums.StatutPanne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
public interface PanneCorrectifRepository extends JpaRepository<PanneCorrectif, Long> {
    List<PanneCorrectif> findByMachineId(Long machineId);
    List<PanneCorrectif> findByTechnicienId(Long technicienId);
    List<PanneCorrectif> findByStatut(StatutPanne statut);
    @Query("SELECT p FROM PanneCorrectif p WHERE p.dateDeclaration BETWEEN :start AND :end")
    List<PanneCorrectif> findByPeriode(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query("SELECT COUNT(p) FROM PanneCorrectif p WHERE p.machine.id = :machineId AND p.statut = 'RESOLUE'")
    Long countResolueByMachine(@Param("machineId") Long machineId);
    @Query("SELECT AVG(p.tempsReparationMinutes) FROM PanneCorrectif p WHERE p.machine.id = :machineId AND p.tempsReparationMinutes IS NOT NULL")
    Double avgTempsReparationByMachine(@Param("machineId") Long machineId);
}
