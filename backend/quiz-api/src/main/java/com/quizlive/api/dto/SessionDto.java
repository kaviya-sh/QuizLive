package com.quizlive.api.dto;

import com.quizlive.core.model.SessionStatus;
import lombok.*;
import java.util.*;

public class SessionDto {
    
    @Data @Builder
    public static class CreateRequest {
        private Long quizId;
    }

    @Data @Builder
    public static class CreateResponse {
        private String roomCode;
        private SessionStatus status;
    }

    @Data @Builder
    public static class StateResponse {
        private String roomCode;
        private SessionStatus status;
        private Integer currentQuestionIndex;
        private Integer participantCount;
        private QuestionData currentQuestion;
        private Map<String, Integer> answerDistribution;
    }

    @Data @Builder
    public static class QuestionData {
        private Long id;
        private String text;
        private List<AnswerOption> answers;
        private Integer timeLimit;
        private Integer points;
    }

    @Data @Builder
    public static class AnswerOption {
        private Long id;
        private String text;
    }

    @Data @Builder
    public static class ParticipantDto {
        private String participantId;
        private String displayName;
        private Integer totalScore;
    }

    @Data @Builder
    public static class LeaderboardEntry {
        private String displayName;
        private Integer totalScore;
        private Integer correctAnswers;
        private Integer rank;
    }
}
