package com.quizlive.core.model;

import lombok.*;
import java.io.Serializable;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ParticipantState implements Serializable {
    private String participantId;
    private String displayName;
    private Integer totalScore;
    private Integer correctAnswers;
    private Long answeredAt;
    private Long answerId;
    @Builder.Default
    private boolean joinedLate = false;
    @Builder.Default
    private boolean spectator = false;
}
