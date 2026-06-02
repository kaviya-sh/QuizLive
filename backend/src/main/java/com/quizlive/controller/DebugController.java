package com.quizlive.controller;

import com.quizlive.entity.User;
import com.quizlive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @GetMapping("/check-user/{email}")
    public Map<String, Object> checkUser(@PathVariable String email) {
        Map<String, Object> result = new HashMap<>();
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            result.put("exists", false);
            result.put("message", "User not found");
            return result;
        }
        
        result.put("exists", true);
        result.put("email", user.getEmail());
        result.put("displayName", user.getDisplayName());
        result.put("role", user.getRole());
        result.put("deleted", user.getDeleted());
        result.put("passwordHashPrefix", user.getPasswordHash().substring(0, 20) + "...");
        result.put("passwordHashLength", user.getPasswordHash().length());
        
        // Test password matching
        boolean matchesDemo123 = passwordEncoder.matches("demo123", user.getPasswordHash());
        boolean matchesPassword = passwordEncoder.matches("password", user.getPasswordHash());
        
        result.put("matchesDemo123", matchesDemo123);
        result.put("matchesPassword", matchesPassword);
        
        return result;
    }
    
    @GetMapping("/test-hash")
    public Map<String, String> testHash() {
        Map<String, String> result = new HashMap<>();
        String hash = passwordEncoder.encode("demo123");
        result.put("newHash", hash);
        result.put("message", "Generated new hash for 'demo123'");
        return result;
    }
}
