package com.gmpp.repository;
import com.gmpp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinataireIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByDestinataireIdAndLueFalseOrderByCreatedAtDesc(Long userId);
    long countByDestinataireIdAndLueFalse(Long userId);
}
