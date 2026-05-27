package com.quizlive.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "time_limit_seconds")
    @Builder.Default
    private Integer timeLimitSeconds = 30;

    @Column
    @Builder.Default
    private Integer points = 100;

    @Column(name = "speed_bonus_enabled")
    @Builder.Default
    private Boolean speedBonusEnabled = true;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Option> options = new ArrayList<>();
}
