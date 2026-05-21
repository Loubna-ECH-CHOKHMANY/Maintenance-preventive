package com.gmpp.repository;
import com.gmpp.entity.PointMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
public interface PointMaintenanceRepository extends JpaRepository<PointMaintenance, Long> {
    List<PointMaintenance> findByMachineId(Long machineId);
    @Query("SELECT p FROM PointMaintenance p WHERE p.prochaineDatePrevue BETWEEN :start AND :end")
    List<PointMaintenance> findBetweenDates(@Param("start") LocalDate start, @Param("end") LocalDate end);
    @Query("SELECT p FROM PointMaintenance p WHERE p.prochaineDatePrevue <= :date")
    List<PointMaintenance> findDue(@Param("date") LocalDate date);
}
