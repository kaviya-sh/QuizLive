package com.quizlive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionDTO {
    private UUID id;
    private String roomCode;
    private String status;
    private Integer currentQuestionIndex;
    private QuizDTO.QuestionDTO currentQuestion;
    private QuizDTO quiz;
    private Integer participantCount;
    private Map<UUID, Integer> answerDistribution;
    private List<ParticipantDTO> participants;
    private Long startTime;
    private Long endTime;
    private Long durationSeconds;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantDTO {
        private UUID id;
        private String displayName;
        private String avatarEmoji;
        private Integer score;
        private Integer streak;
        private Integer rank;
        private Boolean joinedLate;
    }
}
