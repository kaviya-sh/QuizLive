package com.quizlive.controller;

import com.quizlive.entity.User;
import com.quizlive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
@Slf4j
public class AuthDebugController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @GetMapping("/check-user/{email}")
    public ResponseEntity<Map<String, Object>> checkUser(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            response.put("exists", false);
            response.put("message", "User not found");
            return ResponseEntity.ok(response);
        }
        
        response.put("exists", true);
        response.put("email", user.getEmail());
        response.put("displayName", user.getDisplayName());
        response.put("role", user.getRole());
        response.put("deleted", user.getDeleted());
        response.put("hashPrefix", user.getPasswordHash().substring(0, Math.min(20, user.getPasswordHash().length())));
        response.put("hashLength", user.getPasswordHash().length());
        
        // Check BCrypt version
        if (user.getPasswordHash().startsWith("$2a$10$")) {
            response.put("bcryptVersion", "BCrypt strength 10 (Correct)");
        } else if (user.getPasswordHash().startsWith("$2a$08$")) {
            response.put("bcryptVersion", "BCrypt strength 8 (Needs Update)");
        } else {
            response.put("bcryptVersion", "Unknown format");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/test-password")
    public ResponseEntity<Map<String, Object>> testPassword(
            @RequestParam String email,
            @RequestParam String password) {
        
        Map<String, Object> response = new HashMap<>();
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.ok(response);
        }
        
        boolean matches = passwordEncoder.matches(password, user.getPasswordHash());
        
        response.put("success", matches);
        response.put("email", user.getEmail());
        response.put("passwordMatches", matches);
        response.put("hashPrefix", user.getPasswordHash().substring(0, 20));
        
        log.info("Password test for {}: {}", email, matches ? "SUCCESS" : "FAILED");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/generate-hash")
    public ResponseEntity<Map<String, String>> generateHash(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        
        Map<String, String> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hash);
        response.put("bcryptStrength", "10");
        
        return ResponseEntity.ok(response);
    }
}
