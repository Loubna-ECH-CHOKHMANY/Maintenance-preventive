package com.gmpp.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String email;
    private String nomComplet;
    private String role;
    private Long userId;
    private String matricule;
}
