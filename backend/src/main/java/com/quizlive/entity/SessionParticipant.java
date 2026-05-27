package com.quizlive.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "session_participants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private QuizSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "avatar_emoji", length = 10)
    private String avatarEmoji;

    @Column
    @Builder.Default
    private Integer score = 0;

    @Column
    @Builder.Default
    private Integer streak = 0;

    @Column
    private Integer rank;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "joined_late")
    @Builder.Default
    private Boolean joinedLate = false;

    @Column(name = "spectator")
    @Builder.Default
    private Boolean spectator = false;
}
