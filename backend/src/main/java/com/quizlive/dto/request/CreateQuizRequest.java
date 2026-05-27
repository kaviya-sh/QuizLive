package com.quizlive.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CreateQuizRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private String category;
    private String coverImageUrl;
    private String language = "en";
    private List<QuestionRequest> questions;

    @Data
    public static class QuestionRequest {
        private UUID id;
        @NotBlank(message = "Question type is required")
        private String type;
        @NotBlank(message = "Question text is required")
        private String text;
        private String imageUrl;
        private Integer timeLimitSeconds = 30;
        private Integer points = 100;
        private Boolean speedBonusEnabled = true;
        private Integer orderIndex;
        private List<OptionRequest> options;
    }

    @Data
    public static class OptionRequest {
        private UUID id;
        @NotBlank(message = "Option text is required")
        private String text;
        private Boolean isCorrect = false;
        private Integer orderIndex;
    }
}
