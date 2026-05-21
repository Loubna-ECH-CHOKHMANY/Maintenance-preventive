package com.gmpp.dto;
import com.gmpp.enums.TypeNotification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private TypeNotification type;
    private String titre;
    private String message;
    private boolean lue;
    private String lienAction;
    private Long entiteId;
    private String entiteType;
    private LocalDateTime createdAt;
    private LocalDateTime lueLe;
}
