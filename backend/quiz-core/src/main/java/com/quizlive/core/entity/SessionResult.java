package com.quizlive.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_code", nullable = false)
    private String roomCode;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "participant_name", nullable = false)
    private String participantName;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore;

    @Column(name = "correct_answers", nullable = false)
    private Integer correctAnswers;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        completedAt = LocalDateTime.now();
    }
}
