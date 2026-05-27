package com.quizlive.websocket;

import com.quizlive.dto.request.AnswerPayload;
import com.quizlive.service.ScoringEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class QuizWebSocketController {
    
    private final ScoringEngine scoringEngine;
    private final SimpMessagingTemplate messagingTemplate;
    
    @MessageMapping("/session/{roomCode}/answer")
    public void submitAnswer(@DestinationVariable String roomCode, AnswerPayload payload) {
        System.out.println("Received answer from participant: " + payload.getParticipantId());
        
        Map<String, Object> result = scoringEngine.processAnswer(payload);
        
        System.out.println("Sending feedback to participant: " + result);
        
        // Send personal feedback directly to the participant's queue
        messagingTemplate.convertAndSend(
                "/topic/session/" + roomCode + "/participant/" + payload.getParticipantId() + "/feedback",
                result
        );
        
        // Broadcast participant count update
        messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/state", 
                Map.of("type", "ANSWER_SUBMITTED"));
    }
    
    @MessageMapping("/session/{roomCode}/join")
    @SendTo("/topic/session/{roomCode}/participants")
    public Map<String, Object> participantJoined(@DestinationVariable String roomCode, Map<String, Object> payload) {
        return Map.of("type", "JOINED", "data", payload);
    }
}
