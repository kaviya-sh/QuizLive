package com.quizlive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    private UUID id;
    private String displayName;
    private String avatarEmoji;
    private Integer score;
    private Integer rank;
    private Integer previousRank;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double accuracy;
}
