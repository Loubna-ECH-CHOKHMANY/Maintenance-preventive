package com.gmpp.repository;
import com.gmpp.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByOrderByTimestampDesc(Pageable pageable);
    List<AuditLog> findByUtilisateurEmailOrderByTimestampDesc(String email);
    List<AuditLog> findByEntiteAndEntiteId(String entite, Long entiteId);
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :start AND :end ORDER BY a.timestamp DESC")
    List<AuditLog> findByPeriode(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
