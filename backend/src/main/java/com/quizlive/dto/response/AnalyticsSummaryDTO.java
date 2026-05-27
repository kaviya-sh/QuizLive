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
public class AnalyticsSummaryDTO {
    private UUID sessionId;
    private Integer totalParticipants;
    private Double averageScore;
    private Double completionRate;
    private Long durationSeconds;
    private HardestQuestion hardestQuestion;
    private FastestQuestion fastestQuestion;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HardestQuestion {
        private UUID id;
        private String text;
        private Double accuracy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FastestQuestion {
        private UUID id;
        private String text;
        private Double avgResponseTimeMs;
    }
}
