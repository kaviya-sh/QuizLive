package com.quizlive.service;

import com.quizlive.entity.User;
import com.quizlive.exception.ApiException;
import com.quizlive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User updateProfile(UUID userId, String displayName, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        if (displayName != null && !displayName.trim().isEmpty()) {
            user.setDisplayName(displayName.trim());
        }

        if (email != null && !email.trim().isEmpty()) {
            // Check if email is already taken by another user
            userRepository.findByEmail(email).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(userId)) {
                    throw ApiException.badRequest("Email already in use");
                }
            });
            user.setEmail(email.trim());
        }

        return userRepository.save(user);
    }
}
