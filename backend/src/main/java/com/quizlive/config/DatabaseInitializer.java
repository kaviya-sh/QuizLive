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
            // Always reset demo users with a fresh BCrypt hash on startup
            String demoHash = passwordEncoder.encode("demo123");

            List.of("demo@sparklo.in", "demohost@sparklo.in").forEach(email -> {
                userRepository.findByEmail(email).ifPresent(user -> {
                    user.setPasswordHash(demoHash);
                    user.setDeleted(false);
                    userRepository.save(user);
                    log.info("Reset demo password for: {}", email);
                });
            });

            log.info("Demo login - Email: demo@sparklo.in | Password: demo123");
        };
    }
}
