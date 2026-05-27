package com.quizlive.service;

import com.quizlive.dto.response.AnalyticsSummaryDTO;
import com.quizlive.dto.response.LeaderboardDTO;
import com.quizlive.entity.*;
import com.quizlive.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    
    private final QuizSessionRepository sessionRepository;
    private final SessionParticipantRepository participantRepository;
    private final AnswerSubmissionRepository answerRepository;
    private final QuestionRepository questionRepository;
    
    @Transactional(readOnly = true)
    public AnalyticsSummaryDTO getSessionSummary(UUID sessionId) {
        QuizSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        List<SessionParticipant> participants = participantRepository.findBySessionId(sessionId);
        List<AnswerSubmission> answers = answerRepository.findBySessionId(sessionId);
        
        double avgScore = participants.stream()
                .mapToInt(SessionParticipant::getScore)
                .average()
                .orElse(0.0);
        
        long totalQuestions = questionRepository.count();
        double completionRate = participants.isEmpty() ? 0 :
                (double) answers.size() / (participants.size() * totalQuestions) * 100;
        
        long duration = session.getStartedAt() != null && session.getEndedAt() != null ?
                Duration.between(session.getStartedAt(), session.getEndedAt()).getSeconds() : 0;
        
        // Find hardest question (lowest accuracy)
        Map<UUID, Double> questionAccuracy = answers.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getQuestion().getId(),
                        Collectors.averagingInt(a -> a.getIsCorrect() ? 1 : 0)
                ));
        
        UUID hardestQuestionId = questionAccuracy.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        
        Question hardestQuestion = hardestQuestionId != null ?
                questionRepository.findById(hardestQuestionId).orElse(null) : null;
        
        // Find fastest question (lowest avg response time)
        Map<UUID, Double> questionSpeed = answers.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getQuestion().getId(),
                        Collectors.averagingLong(AnswerSubmission::getAnsweredAtMs)
                ));
        
        UUID fastestQuestionId = questionSpeed.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        
        Question fastestQuestion = fastestQuestionId != null ?
                questionRepository.findById(fastestQuestionId).orElse(null) : null;
        
        return AnalyticsSummaryDTO.builder()
                .sessionId(sessionId)
                .totalParticipants(participants.size())
                .averageScore(avgScore)
                .completionRate(completionRate)
                .durationSeconds(duration)
                .hardestQuestion(hardestQuestion != null ?
                        AnalyticsSummaryDTO.HardestQuestion.builder()
                                .id(hardestQuestion.getId())
                                .text(hardestQuestion.getText())
                                .accuracy(questionAccuracy.get(hardestQuestion.getId()) * 100)
                                .build() : null)
                .fastestQuestion(fastestQuestion != null ?
                        AnalyticsSummaryDTO.FastestQuestion.builder()
                                .id(fastestQuestion.getId())
                                .text(fastestQuestion.getText())
                                .avgResponseTimeMs(questionSpeed.get(fastestQuestion.getId()))
                                .build() : null)
                .build();
    }
    
    @Transactional(readOnly = true)
    public byte[] generateCSV(UUID sessionId) {
        List<SessionParticipant> participants = participantRepository.findBySessionIdOrderByScoreDesc(sessionId);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        writer.println("Rank,Display Name,Score,Correct Answers,Accuracy");
        
        for (int i = 0; i < participants.size(); i++) {
            SessionParticipant p = participants.get(i);
            List<AnswerSubmission> answers = answerRepository.findBySessionId(sessionId);
            long correct = answers.stream().filter(a -> a.getParticipant().getId().equals(p.getId()) && a.getIsCorrect()).count();
            long total = answers.stream().filter(a -> a.getParticipant().getId().equals(p.getId())).count();
            double accuracy = total > 0 ? (double) correct / total * 100 : 0;
            
            writer.printf("%d,%s,%d,%d,%.2f%%\n",
                    i + 1, p.getDisplayName(), p.getScore(), correct, accuracy);
        }
        
        writer.flush();
        return outputStream.toByteArray();
    }
    
    @Transactional(readOnly = true)
    public List<LeaderboardDTO> getLeaderboard(UUID sessionId) {
        List<SessionParticipant> participants = participantRepository.findBySessionIdOrderByScoreDesc(sessionId);
        
        return participants.stream()
                .map(p -> {
                    List<AnswerSubmission> answers = answerRepository.findBySessionId(sessionId);
                    long correct = answers.stream()
                            .filter(a -> a.getParticipant().getId().equals(p.getId()) && a.getIsCorrect())
                            .count();
                    long total = answers.stream()
                            .filter(a -> a.getParticipant().getId().equals(p.getId()))
                            .count();
                    
                    return LeaderboardDTO.builder()
                            .id(p.getId())
                            .displayName(p.getDisplayName())
                            .avatarEmoji(p.getAvatarEmoji())
                            .score(p.getScore())
                            .rank(p.getRank())
                            .correctAnswers((int) correct)
                            .totalQuestions((int) total)
                            .accuracy(total > 0 ? (double) correct / total * 100 : 0.0)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
