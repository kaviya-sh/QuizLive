package com.quizlive.repository;

import com.quizlive.entity.SessionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, UUID> {
    List<SessionParticipant> findBySessionIdAndIsActiveTrue(UUID sessionId);
    List<SessionParticipant> findBySessionIdOrderByScoreDesc(UUID sessionId);
    List<SessionParticipant> findBySessionId(UUID sessionId);
    List<SessionParticipant> findByUserIdOrderByJoinedAtDesc(UUID userId);
}
