package com.quizlive.repository;

import com.quizlive.entity.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizSessionRepository extends JpaRepository<QuizSession, UUID> {
    Optional<QuizSession> findByRoomCode(String roomCode);
    List<QuizSession> findByHostIdAndStatusIn(UUID hostId, List<String> statuses);
    List<QuizSession> findByHostIdOrderByCreatedAtDesc(UUID hostId);
}
