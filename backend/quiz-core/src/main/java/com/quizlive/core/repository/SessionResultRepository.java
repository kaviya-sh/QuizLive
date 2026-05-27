package com.quizlive.core.repository;

import com.quizlive.core.entity.SessionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionResultRepository extends JpaRepository<SessionResult, Long> {
    List<SessionResult> findByRoomCodeOrderByTotalScoreDesc(String roomCode);
}
