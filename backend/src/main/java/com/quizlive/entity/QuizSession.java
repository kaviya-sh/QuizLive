package com.quizlive.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quiz_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @Column(name = "room_code", unique = true, nullable = false, length = 6)
    private String roomCode;

    @Column(length = 50)
    @Builder.Default
    private String status = "WAITING";

    @Column(name = "current_question_index")
    @Builder.Default
    private Integer currentQuestionIndex = 0;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
