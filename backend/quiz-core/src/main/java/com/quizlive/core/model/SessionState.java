package com.quizlive.core.model;

import lombok.*;
import java.io.Serializable;
import java.util.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SessionState implements Serializable {
    private String roomCode;
    private Long quizId;
    private SessionStatus status;
    private Integer currentQuestionIndex;
    private Long currentQuestionId;
    private Long questionStartTime;
    @Builder.Default
    private Map<String, ParticipantState> participants = new HashMap<>();
    @Builder.Default
    private Map<String, Integer> answerDistribution = new HashMap<>();
}
