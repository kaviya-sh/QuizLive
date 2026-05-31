package com.quizlive.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthController {
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
            "status", "running",
            "service", "QuizLive Backend API",
            "docs", "/swagger-ui.html"
        );
    }
    
    @GetMapping("/api/generate-hash")
    public Map<String, String> generateHash(@RequestParam(defaultValue = "demo123") String password) {
        String hash = passwordEncoder.encode(password);
        return Map.of(
            "password", password,
            "hash", hash,
            "sql_participant", "INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled) VALUES ('demo@sparklo.in', '" + hash + "', 'Demo Participant', 'ROLE_PARTICIPANT', NOW(), NOW(), true) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;",
            "sql_host", "INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled) VALUES ('demohost@sparklo.in', '" + hash + "', 'Demo Host', 'ROLE_HOST', NOW(), NOW(), true) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;"
        );
    }
}
