package com.gmpp.config;

import com.gmpp.security.JwtAuthFilter;
import com.gmpp.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration @EnableWebSecurity @EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtFilter;
    private final CustomUserDetailsService uds;
    public SecurityConfig(JwtAuthFilter jwtFilter, CustomUserDetailsService uds) {
        this.jwtFilter = jwtFilter; this.uds = uds;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(c -> c.configurationSource(corsSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**",
                    "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                    "/actuator/**", "/ws/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/qrcode/**").authenticated()
                // Utilisateurs
                .requestMatchers(HttpMethod.GET, "/utilisateurs/**")
                    .hasAnyRole("ADMIN","RESPONSABLE_MAINTENANCE","CHEF_EQUIPE")
                .requestMatchers(HttpMethod.POST, "/utilisateurs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/utilisateurs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/utilisateurs/**").hasRole("ADMIN")
                // Machines
                .requestMatchers(HttpMethod.GET, "/machines/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/machines/**")
                    .hasAnyRole("ADMIN","RESPONSABLE_MAINTENANCE")
                .requestMatchers(HttpMethod.PUT, "/machines/**")
                    .hasAnyRole("ADMIN","RESPONSABLE_MAINTENANCE")
                .requestMatchers(HttpMethod.PATCH, "/machines/**")
                    .hasAnyRole("ADMIN","RESPONSABLE_MAINTENANCE")
                .requestMatchers(HttpMethod.DELETE, "/machines/**").hasRole("ADMIN")
                // Points maintenance
                .requestMatchers(HttpMethod.GET, "/points-maintenance/**").authenticated()
                .requestMatchers("/points-maintenance/**")
                    .hasAnyRole("ADMIN","RESPONSABLE_MAINTENANCE")
                // Dashboard + KPI
                .requestMatchers("/dashboard/**", "/kpi/**")
                    .hasAnyRole("ADMIN","RESPONSABLE_MAINTENANCE")
                // Stock
                .requestMatchers(HttpMethod.GET, "/stock/**").authenticated()
                .requestMatchers("/stock/**")
                    .hasAnyRole("ADMIN","RESPONSABLE_MAINTENANCE","CHEF_EQUIPE","TECHNICIEN")
                // Pannes - tous peuvent déclarer
                .requestMatchers("/pannes/**").authenticated()
                // Export
                .requestMatchers("/export/**")
                    .hasAnyRole("ADMIN","RESPONSABLE_MAINTENANCE")
                // Audit - admin only
                .requestMatchers("/audit/**").hasRole("ADMIN")
                // Notifications - tous
                .requestMatchers("/notifications/**").authenticated()
                // Interventions
                .requestMatchers("/interventions/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }

    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public DaoAuthenticationProvider authProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds); p.setPasswordEncoder(passwordEncoder());
        return p;
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
