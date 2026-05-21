package com.gmpp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gmpp.enums.RoleUtilisateur;
import com.gmpp.enums.Specialite;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name = "utilisateurs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Utilisateur implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nomComplet;
    @Column(nullable = false, unique = true)
    private String matricule;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    @JsonIgnore
    private String motDePasse;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private RoleUtilisateur role;
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private List<Specialite> specialites = new ArrayList<>();
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> certifications = new ArrayList<>();
    @Builder.Default
    private boolean actif = true;
    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "technicien", fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<Intervention> interventions;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    @Override @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    @Override @JsonIgnore public String getPassword()   { return motDePasse; }
    @Override @JsonIgnore public String getUsername()   { return email; }
    @Override @JsonIgnore public boolean isAccountNonExpired()     { return true; }
    @Override @JsonIgnore public boolean isAccountNonLocked()      { return true; }
    @Override @JsonIgnore public boolean isCredentialsNonExpired() { return true; }
    @Override @JsonIgnore public boolean isEnabled()               { return actif; }
}
