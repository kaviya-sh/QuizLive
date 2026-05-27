package com.quizlive.controller;

import com.quizlive.dto.response.AnalyticsSummaryDTO;
import com.quizlive.dto.response.LeaderboardDTO;
import com.quizlive.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    
    @GetMapping("/{sessionId}/summary")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(analyticsService.getSessionSummary(sessionId));
    }
    
    @GetMapping("/{sessionId}/csv")
    public ResponseEntity<byte[]> downloadCSV(@PathVariable UUID sessionId) {
        byte[] csv = analyticsService.generateCSV(sessionId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analytics.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
    
    @GetMapping("/{sessionId}/leaderboard")
    public ResponseEntity<List<LeaderboardDTO>> getLeaderboard(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(analyticsService.getLeaderboard(sessionId));
    }
}
