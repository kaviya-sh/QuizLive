package com.quizlive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
    private UUID id;
    private String title;
    private String description;
    private String category;
    private String coverImageUrl;
    private String language;
    private String status;
    private List<QuestionDTO> questions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionDTO {
        private UUID id;
        private String type;
        private String text;
        private String imageUrl;
        private Integer timeLimitSeconds;
        private Integer points;
        private Boolean speedBonusEnabled;
        private Integer orderIndex;
        private List<OptionDTO> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionDTO {
        private UUID id;
        private String text;
        private Boolean isCorrect;
        private Integer orderIndex;
    }
}
