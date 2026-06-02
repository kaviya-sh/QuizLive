package com.quizlive.config;

import com.quizlive.entity.User;
import com.quizlive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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
            log.info("INITIALIZING DEMO USERS");
            log.info("=".repeat(60));
            
            // Correct BCrypt hash for "demo123" with strength 10
            String correctHash = "$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2";
            
            // Create or update demo participant
            createOrUpdateUser("demo@sparklo.in", correctHash, "Demo Participant", "ROLE_PARTICIPANT");
            
            // Create or update demo host
            createOrUpdateUser("demohost@sparklo.in", correctHash, "Demo Host", "ROLE_HOST");
            
            log.info("=".repeat(60));
            log.info("DEMO USERS INITIALIZATION COMPLETE");
            log.info("Login with: demo@sparklo.in or demohost@sparklo.in");
            log.info("Password: demo123");
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
            // Update password if it's different
            if (!user.getPasswordHash().equals(passwordHash)) {
                user.setPasswordHash(passwordHash);
                user.setDeleted(false);
                userRepository.save(user);
                log.info("✓ Updated password for: {} ({})", email, role);
            } else {
                log.info("✓ User already exists with correct password: {} ({})", email, role);
            }
        }
    }
}
