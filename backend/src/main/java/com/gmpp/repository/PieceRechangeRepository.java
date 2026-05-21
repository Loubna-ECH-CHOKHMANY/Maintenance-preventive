package com.gmpp.repository;
import com.gmpp.entity.PieceRechange;
import com.gmpp.enums.CategoriePiece;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface PieceRechangeRepository extends JpaRepository<PieceRechange, Long> {
    List<PieceRechange> findByCategorie(CategoriePiece categorie);
    @Query("SELECT p FROM PieceRechange p WHERE p.quantiteStock <= p.seuilAlerteMin")
    List<PieceRechange> findPiecesEnAlerte();
    @Query("SELECT p FROM PieceRechange p WHERE p.quantiteStock = 0")
    List<PieceRechange> findPiecesEnRupture();
    boolean existsByReference(String reference);
}
