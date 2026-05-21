package com.gmpp.repository;
import com.gmpp.entity.Intervention;
import com.gmpp.enums.StatutIntervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
public interface InterventionRepository extends JpaRepository<Intervention, Long> {
    List<Intervention> findByMachineId(Long machineId);
    List<Intervention> findByTechnicienId(Long technicienId);
    List<Intervention> findByStatut(StatutIntervention statut);
    List<Intervention> findByPointMaintenanceId(Long pmId);
    @Query("SELECT i FROM Intervention i WHERE i.datePlanifiee BETWEEN :s AND :e ORDER BY i.datePlanifiee")
    List<Intervention> findByPeriode(@Param("s") LocalDateTime s, @Param("e") LocalDateTime e);
    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.statut='PLANIFIEE' AND i.datePlanifiee < :now")
    long countEnRetard(@Param("now") LocalDateTime now);
    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.statut='TERMINEE' AND i.datePlanifiee BETWEEN :s AND :e")
    long countTerminees(@Param("s") LocalDateTime s, @Param("e") LocalDateTime e);
    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.datePlanifiee BETWEEN :s AND :e")
    long countPlanifiees(@Param("s") LocalDateTime s, @Param("e") LocalDateTime e);
    @Query("SELECT AVG(i.dureeEffectiveMinutes) FROM Intervention i WHERE i.statut='TERMINEE'")
    Double avgDuree();
}
