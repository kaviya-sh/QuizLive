package com.quizlive.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
public class SessionTimerService {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, ScheduledFuture<?>> activeTimers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
    
    public void startQuestionTimer(String roomCode, int durationSeconds) {
        stopTimer(roomCode);
        
        ScheduledFuture<?> timer = scheduler.scheduleAtFixedRate(() -> {
            long remainingMs = getRemainingTime(roomCode);
            if (remainingMs <= 0) {
                stopTimer(roomCode);
                messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/timer", 
                        Map.of("remainingSeconds", 0, "expired", true));
            } else {
                messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/timer", 
                        Map.of("remainingSeconds", remainingMs / 1000));
            }
        }, 0, 500, TimeUnit.MILLISECONDS);
        
        activeTimers.put(roomCode, timer);
    }
    
    public void stopTimer(String roomCode) {
        ScheduledFuture<?> timer = activeTimers.remove(roomCode);
        if (timer != null) {
            timer.cancel(false);
        }
    }
    
    private long getRemainingTime(String roomCode) {
        // Implementation would track start time and calculate remaining
        return 30000; // Placeholder
    }
}
