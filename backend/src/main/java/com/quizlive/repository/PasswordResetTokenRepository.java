package com.quizlive.repository;

import com.quizlive.entity.PasswordResetToken;
import com.quizlive.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByExpiryDateBefore(LocalDateTime now);
    void deleteByUser(User user);
}
