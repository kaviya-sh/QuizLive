package com.quizlive.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class AnswerPayload {
    private UUID sessionId;
    private UUID participantId;
    private UUID questionId;
    private UUID optionId;
    private Long answeredAtMs;
}
