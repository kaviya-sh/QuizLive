package com.quizlive.security;

import com.quizlive.entity.User;
import com.quizlive.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                Claims claims = jwtUtil.validateToken(token);
                String tokenType = claims.get("type", String.class);
                
                if ("ACCESS".equals(tokenType)) {
                    UUID userId = UUID.fromString(claims.getSubject());
                    User user = userRepository.findById(userId).orElse(null);
                    
                    if (user != null && !user.getDeleted()) {
                        // Ensure role has ROLE_ prefix for Spring Security
                        String role = user.getRole();
                        if (role != null && !role.startsWith("ROLE_")) {
                            role = "ROLE_" + role;
                        }
                        
                        System.out.println("User role from DB: " + user.getRole());
                        System.out.println("Authority being set: " + role);
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority(role))
                        );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception e) {
                // Invalid token, continue without authentication
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
