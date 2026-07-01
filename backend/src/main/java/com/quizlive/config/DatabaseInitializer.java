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
            String demoHash = passwordEncoder.encode("demo123");

            upsertDemoUser("demo@sparklo.in",     "Demo Participant", "ROLE_PARTICIPANT", demoHash);
            upsertDemoUser("demohost@sparklo.in", "Demo Host",        "ROLE_HOST",        demoHash);

            log.info("Demo login - Email: demo@sparklo.in / demohost@sparklo.in | Password: demo123");
        };
    }

    private void upsertDemoUser(String email, String displayName, String role, String hash) {
        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                user.setPasswordHash(hash);
                user.setDeleted(false);
                userRepository.save(user);
                log.info("Reset demo password for: {}", email);
            },
            () -> {
                userRepository.save(User.builder()
                    .email(email)
                    .displayName(displayName)
                    .role(role)
                    .passwordHash(hash)
                    .deleted(false)
                    .build());
                log.info("Created demo user: {}", email);
            }
        );
    }
}
