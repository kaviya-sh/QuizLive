package com.quizlive.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateSessionRequest {
    @NotNull(message = "Quiz ID is required")
    private UUID quizId;
    private SessionSettings settings;
    
    @Data
    public static class SessionSettings {
        private Integer maxParticipants = 50;
        private Boolean showLeaderboard = true;
        private Boolean allowLateJoin = true;
    }
}
