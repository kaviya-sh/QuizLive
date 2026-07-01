package com.quizlive.config;

import com.quizlive.entity.User;
import com.quizlive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            log.info("=".repeat(60));
            log.info("DATABASE INITIALIZATION CHECK");
            log.info("=".repeat(60));
            
            // Generate demo password hash using the same encoder as the app
            String demoPasswordHash = passwordEncoder.encode("demo123");
            
            // Create or update demo participant
            createOrUpdateUser("demo@sparklo.in", demoPasswordHash, "Demo Participant", "ROLE_PARTICIPANT");
            
            // Create or update demo host
            createOrUpdateUser("demohost@sparklo.in", demoPasswordHash, "Demo Host", "ROLE_HOST");
            
            // Check all users for password hash issues
            log.info("Checking all users for password hash format...");
            List<User> allUsers = userRepository.findAll();
            int invalidCount = 0;
            
            for (User user : allUsers) {
                String hash = user.getPasswordHash();
                // Valid BCrypt hash should start with $2a$ or $2b$
                if (hash == null || (!hash.startsWith("$2a$") && !hash.startsWith("$2b$"))) {
                    log.warn("⚠ User {} has invalid or non-standard BCrypt hash: {}", 
                            user.getEmail(), 
                            hash != null ? hash.substring(0, Math.min(20, hash.length())) + "..." : "NULL");
                    invalidCount++;
                }
            }
            
            if (invalidCount > 0) {
                log.warn("=".repeat(60));
                log.warn("ATTENTION: {} users have non-standard password hashes!", invalidCount);
                log.warn("These users may experience login issues.");
                log.warn("Users should use 'Forgot Password' to reset their passwords.");
                log.warn("=".repeat(60));
            }
            
            log.info("=".repeat(60));
            log.info("DATABASE INITIALIZATION COMPLETE");
            log.info("Total users: {}, Users with issues: {}", allUsers.size(), invalidCount);
            log.info("Demo login - Email: demo@sparklo.in | Password: demo123");
            log.info("=".repeat(60));
        };
    }
    
    private void createOrUpdateUser(String email, String passwordHash, String displayName, String role) {
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .passwordHash(passwordHash)
                    .displayName(displayName)
                    .role(role)
                    .deleted(false)
                    .build();
            userRepository.save(user);
            log.info("✓ Created user: {} ({})", email, role);
        } else {
            // Only fix if hash is invalid (not a valid BCrypt hash)
            String existingHash = user.getPasswordHash();
            boolean isValidBcrypt = existingHash != null && 
                (existingHash.startsWith("$2a$") || existingHash.startsWith("$2b$"));
            if (!isValidBcrypt) {
                user.setPasswordHash(passwordHash);
                user.setDeleted(false);
                userRepository.save(user);
                log.info("✓ Fixed invalid hash for: {} ({})", email, role);
            } else {
                log.info("✓ User already exists with valid hash: {} ({})", email, role);
            }
        }
    }
}
