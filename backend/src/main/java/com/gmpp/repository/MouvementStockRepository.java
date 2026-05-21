package com.gmpp.repository;
import com.gmpp.entity.MouvementStock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {
    List<MouvementStock> findByPieceIdOrderByCreatedAtDesc(Long pieceId);
    List<MouvementStock> findByInterventionId(Long interventionId);
}
