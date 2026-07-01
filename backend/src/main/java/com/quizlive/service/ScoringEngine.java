package com.quizlive.service;

import com.quizlive.dto.request.AnswerPayload;
import com.quizlive.entity.*;
import com.quizlive.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ScoringEngine {
    
    private final AnswerSubmissionRepository answerRepository;
    private final SessionParticipantRepository participantRepository;
    private final QuestionRepository questionRepository;
    private final QuizSessionRepository sessionRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public Map<String, Object> processAnswer(AnswerPayload payload) {
        // Get session by ID (which is actually the UUID)
        QuizSession session = sessionRepository.findById(payload.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        // Check if already answered
        boolean alreadyAnswered = answerRepository.existsBySessionIdAndParticipantIdAndQuestionId(
                session.getId(), payload.getParticipantId(), payload.getQuestionId());
        
        if (alreadyAnswered) {
            return Map.of("error", "Already answered this question");
        }
        
        SessionParticipant participant = participantRepository.findById(payload.getParticipantId())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        Question question = questionRepository.findById(payload.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        // Find correct option
        Option correctOption = question.getOptions().stream()
                .filter(Option::getIsCorrect)
                .findFirst()
                .orElse(null);
        
        boolean isCorrect = correctOption != null && correctOption.getId().equals(payload.getOptionId());
        
        int pointsEarned = 0;
        if (isCorrect) {
            // Calculate time-based points
            long responseTime = payload.getAnsweredAtMs();
            long timeLimit = question.getTimeLimitSeconds() * 1000L;
            double timeRatio = (double) responseTime / timeLimit;
            
            if (question.getSpeedBonusEnabled()) {
                if (timeRatio <= 0.2) {
                    pointsEarned = question.getPoints(); // Full points
                } else {
                    // Linear decay from 100% to 50%
                    double pointsMultiplier = 1.0 - (timeRatio - 0.2) * 0.625;
                    pointsEarned = (int) (question.getPoints() * Math.max(0.5, pointsMultiplier));
                }
            } else {
                pointsEarned = question.getPoints();
            }
            
            // Streak bonus
            int newStreak = participant.getStreak() + 1;
            if (newStreak >= 3) {
                pointsEarned = (int) (pointsEarned * 1.5);
            }
            participant.setStreak(newStreak);
        } else {
            participant.setStreak(0);
        }
        
        // Update participant score
        participant.setScore(participant.getScore() + pointsEarned);
        participantRepository.save(participant);
        
        // Save answer submission
        AnswerSubmission submission = AnswerSubmission.builder()
                .session(participant.getSession())
                .participant(participant)
                .question(question)
                .option(question.getOptions().stream()
                        .filter(o -> o.getId().equals(payload.getOptionId()))
                        .findFirst()
                        .orElse(null))
                .isCorrect(isCorrect)
                .pointsEarned(pointsEarned)
                .answeredAtMs(payload.getAnsweredAtMs())
                .build();
        
        answerRepository.save(submission);
        
        // Update answer distribution in Redis and broadcast to host
        try {
            String distributionKey = "distribution:" + payload.getSessionId() + ":" + payload.getQuestionId();
            redisTemplate.opsForHash().increment(distributionKey, payload.getOptionId().toString(), 1);
            Map<Object, Object> rawDistribution = redisTemplate.opsForHash().entries(distributionKey);
            Map<String, Object> distribution = new HashMap<>();
            rawDistribution.forEach((k, v) -> distribution.put(k.toString(), Integer.parseInt(v.toString())));
            messagingTemplate.convertAndSend("/topic/session/" + session.getRoomCode() + "/distribution", distribution);
        } catch (Exception e) {
            System.err.println("Redis error (distribution): " + e.getMessage());
        }
        
        return Map.of(
                "isCorrect", isCorrect,
                "correctOptionId", correctOption != null ? correctOption.getId() : null,
                "selectedOptionId", payload.getOptionId(),
                "pointsEarned", pointsEarned,
                "totalScore", participant.getScore(),
                "streak", participant.getStreak()
        );
    }
}
