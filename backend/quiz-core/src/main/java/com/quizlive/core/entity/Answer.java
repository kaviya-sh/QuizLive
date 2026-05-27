package com.quizlive.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private String text;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect = false;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
