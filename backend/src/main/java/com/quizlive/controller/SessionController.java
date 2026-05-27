package com.quizlive.controller;

import com.quizlive.dto.request.CreateSessionRequest;
import com.quizlive.dto.response.SessionDTO;
import com.quizlive.entity.User;
import com.quizlive.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {
    
    private final SessionService sessionService;
    
    @PostMapping
    public ResponseEntity<SessionDTO> createSession(@Valid @RequestBody CreateSessionRequest request,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.createSession(request.getQuizId(), user.getId()));
    }
    
    @GetMapping("/{roomCode}")
    public ResponseEntity<SessionDTO> getSession(@PathVariable String roomCode) {
        return ResponseEntity.ok(sessionService.getSessionByRoomCode(roomCode));
    }
    
    @PatchMapping("/{roomCode}/start")
    public ResponseEntity<SessionDTO> startSession(@PathVariable String roomCode) {
        return ResponseEntity.ok(sessionService.startSession(roomCode));
    }
    
    @PatchMapping("/{roomCode}/next")
    public ResponseEntity<SessionDTO> nextQuestion(@PathVariable String roomCode) {
        return ResponseEntity.ok(sessionService.nextQuestion(roomCode));
    }
    
    @PatchMapping("/{roomCode}/end")
    public ResponseEntity<Void> endSession(@PathVariable String roomCode) {
        sessionService.endSession(roomCode);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{roomCode}/qr")
    public ResponseEntity<byte[]> getQRCode(@PathVariable String roomCode) throws Exception {
        byte[] qrCode = sessionService.generateQRCode(roomCode);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCode);
    }
    
    @GetMapping("/active")
    public ResponseEntity<java.util.List<SessionDTO>> getActiveSessions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(sessionService.getActiveSessionsByHost(user.getId()));
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<SessionDTO>> getSessionHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(sessionService.getSessionHistory(user.getId()));
    }

    @GetMapping("/{roomCode}/leaderboard")
    public ResponseEntity<java.util.List<com.quizlive.dto.response.SessionDTO.ParticipantDTO>> getLeaderboard(
            @PathVariable String roomCode) {
        return ResponseEntity.ok(sessionService.getLeaderboard(roomCode));
    }

    @PostMapping("/{roomCode}/join")
    public ResponseEntity<Map<String, Object>> joinSession(
            @PathVariable String roomCode,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User user) {
        String displayName = request.get("displayName");
        String avatarEmoji = request.getOrDefault("avatarEmoji", "😊");
        java.util.UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(sessionService.joinSession(roomCode, displayName, avatarEmoji, userId));
    }
}
