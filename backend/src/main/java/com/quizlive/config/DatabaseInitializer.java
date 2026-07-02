package com.quizlive.config;

import com.quizlive.entity.User;
import com.quizlive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer {

    private final UserRepository userRepository;

    // Verified BCrypt(10) hash for 'demo123' — do NOT re-encode on startup
    private static final String DEMO_HASH = "$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2";

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            upsertDemoUser("demo@sparklo.in",     "Demo Participant", "ROLE_PARTICIPANT");
            upsertDemoUser("demohost@sparklo.in", "Demo Host",        "ROLE_HOST");
            log.info("Demo login — demo@sparklo.in / demohost@sparklo.in | password: demo123");
        };
    }

    private void upsertDemoUser(String email, String displayName, String role) {
        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                user.setPasswordHash(DEMO_HASH);
                user.setDeleted(false);
                userRepository.save(user);
                log.info("Reset demo user: {}", email);
            },
            () -> {
                userRepository.save(User.builder()
                    .email(email)
                    .displayName(displayName)
                    .role(role)
                    .passwordHash(DEMO_HASH)
                    .deleted(false)
                    .build());
                log.info("Created demo user: {}", email);
            }
        );
    }
}
