package com.quizlive.config;

import com.quizlive.entity.User;
import com.quizlive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer {
    
    private final UserRepository userRepository;
    
    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            log.info("=".repeat(60));
            log.info("DATABASE INITIALIZATION CHECK");
            log.info("=".repeat(60));
            
            // Check all users for password hash issues
            List<User> allUsers = userRepository.findAll();
            int invalidCount = 0;
            
            for (User user : allUsers) {
                String hash = user.getPasswordHash();
                if (hash == null || (!hash.startsWith("$2a$") && !hash.startsWith("$2b$"))) {
                    log.warn("User {} has invalid BCrypt hash", user.getEmail());
                    invalidCount++;
                }
            }
            
            log.info("Total users: {}, Users with invalid hashes: {}", allUsers.size(), invalidCount);
            log.info("Demo login - Email: demo@sparklo.in | Password: demo123");
            log.info("=".repeat(60));
        };
    }
    
}
