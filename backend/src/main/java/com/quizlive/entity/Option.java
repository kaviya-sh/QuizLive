package com.quizlive.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "options")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Option {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(name = "is_correct")
    @Builder.Default
    private Boolean isCorrect = false;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
