package com.quizlive.controller;

import com.quizlive.entity.User;
import com.quizlive.service.SessionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ParticipantController {

    private final SessionService sessionService;

    @PostMapping("/{roomCode}/join")
    public ResponseEntity<Map<String, Object>> joinSession(@PathVariable String roomCode,
                                                           @RequestBody JoinRequest request,
                                                           @AuthenticationPrincipal User user) {
        UUID userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(sessionService.joinSession(roomCode, request.getDisplayName(), request.getAvatarEmoji(), userId));
    }

    @GetMapping("/{roomCode}/results")
    public ResponseEntity<Map<String, Object>> getParticipantResults(@PathVariable String roomCode,
                                                                      @RequestParam String participantId) {
        return ResponseEntity.ok(sessionService.getParticipantResults(roomCode, UUID.fromString(participantId)));
    }

    /** Returns past quiz sessions for a participant identified by their participantId. */
    @GetMapping("/participant/history")
    public ResponseEntity<List<Map<String, Object>>> getParticipantHistory(@RequestParam String participantId) {
        return ResponseEntity.ok(sessionService.getParticipantHistory(UUID.fromString(participantId)));
    }

    /** Returns past quiz sessions for the logged-in user */
    @GetMapping("/my-history")
    public ResponseEntity<List<Map<String, Object>>> getMyHistory(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(sessionService.getParticipantHistoryByUserId(user.getId()));
    }

    @Data
    public static class JoinRequest {
        private String displayName;
        private String avatarEmoji;
    }
}
