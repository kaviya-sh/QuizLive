package com.quizlive.controller;

import com.quizlive.dto.request.CreateQuizRequest;
import com.quizlive.dto.response.QuizDTO;
import com.quizlive.entity.User;
import com.quizlive.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Slf4j
public class QuizController {
    
    private final QuizService quizService;
    
    @GetMapping
    public ResponseEntity<Page<QuizDTO>> getQuizzes(@AuthenticationPrincipal User user, Pageable pageable) {
        return ResponseEntity.ok(quizService.getHostQuizzes(user.getId(), pageable));
    }
    
    @PostMapping
    public ResponseEntity<QuizDTO> createQuiz(@Valid @RequestBody CreateQuizRequest request,
                                              @AuthenticationPrincipal User user) {
        try {
            log.info("Creating quiz for user: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(quizService.createQuiz(request, user.getId()));
        } catch (Exception e) {
            log.error("Error creating quiz", e);
            throw e;
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuiz(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable UUID id,
                                              @Valid @RequestBody CreateQuizRequest request,
                                              @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request, user.getId()));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable UUID id,
                                           @AuthenticationPrincipal User user) {
        quizService.deleteQuiz(id, user.getId());
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/publish")
    public ResponseEntity<QuizDTO> publishQuiz(@PathVariable UUID id,
                                               @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.publishQuiz(id, user.getId()));
    }
}
