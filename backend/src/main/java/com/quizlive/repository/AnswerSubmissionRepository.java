package com.quizlive.repository;

import com.quizlive.entity.AnswerSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnswerSubmissionRepository extends JpaRepository<AnswerSubmission, UUID> {
    List<AnswerSubmission> findBySessionId(UUID sessionId);
    
    List<AnswerSubmission> findByParticipantId(UUID participantId);

    List<AnswerSubmission> findBySessionIdAndQuestionId(UUID sessionId, UUID questionId);
    
    @Query("SELECT COUNT(a) FROM AnswerSubmission a WHERE a.session.id = :sessionId AND a.question.id = :questionId")
    long countBySessionIdAndQuestionId(UUID sessionId, UUID questionId);
    
    boolean existsBySessionIdAndParticipantIdAndQuestionId(UUID sessionId, UUID participantId, UUID questionId);
}
