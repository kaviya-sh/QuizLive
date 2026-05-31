package com.quizlive.config;

import com.quizlive.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/error").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/sessions/*/join").permitAll()
                .requestMatchers("/api/sessions/*/results").permitAll()
                .requestMatchers("/api/sessions/my-history").authenticated()
                .requestMatchers("/api/sessions/participant/history").permitAll()
                .requestMatchers("/api/sessions/*").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/quizzes/**").hasAuthority("ROLE_HOST")
                .requestMatchers("/api/sessions/*/start").hasAuthority("ROLE_HOST")
                .requestMatchers("/api/sessions/*/next").hasAuthority("ROLE_HOST")
                .requestMatchers("/api/sessions/*/end").hasAuthority("ROLE_HOST")
                .requestMatchers("/api/sessions/active").hasAuthority("ROLE_HOST")
                .requestMatchers("/api/sessions/history").hasAuthority("ROLE_HOST")
                .requestMatchers("/api/analytics/**").authenticated()
                .requestMatchers("/api/ai/**").hasAuthority("ROLE_HOST")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Use strength 10 instead of default 10-12 for faster authentication
        // This is still secure but provides better performance
        return new BCryptPasswordEncoder(10);
    }
}
