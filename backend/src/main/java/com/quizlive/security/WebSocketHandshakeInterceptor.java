package com.quizlive.security;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {
    
    private final JwtUtil jwtUtil;
    
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            String token = servletRequest.getServletRequest().getParameter("token");
            
            log.info("WebSocket handshake attempt from: {}", request.getRemoteAddress());
            
            if (token != null) {
                try {
                    Claims claims = jwtUtil.validateToken(token);
                    UUID userId = UUID.fromString(claims.getSubject());
                    String tokenType = claims.get("type", String.class);
                    
                    attributes.put("userId", userId);
                    attributes.put("tokenType", tokenType);
                    
                    log.info("WebSocket handshake successful for user: {} (type: {})", userId, tokenType);
                    return true;
                } catch (Exception e) {
                    log.error("WebSocket handshake failed - Invalid token: {}", e.getMessage());
                    return false;
                }
            } else {
                log.warn("WebSocket handshake - No token provided");
            }
        }
        return true; // Allow connection without token for public endpoints
    }
    
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket handshake error: {}", exception.getMessage());
        }
    }
}
