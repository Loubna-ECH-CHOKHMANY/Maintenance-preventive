package com.gmpp.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogDTO {
    private Long id;
    private String utilisateurEmail;
    private String action;
    private String entite;
    private Long entiteId;
    private String details;
    private String ipAddress;
    private boolean succes;
    private String messageErreur;
    private LocalDateTime timestamp;
}
