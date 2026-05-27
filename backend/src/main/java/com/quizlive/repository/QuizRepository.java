package com.quizlive.repository;

import com.quizlive.entity.Quiz;
import com.quizlive.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    Page<Quiz> findByHostAndDeletedFalse(User host, Pageable pageable);
    
    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :id AND q.deleted = false")
    Optional<Quiz> findByIdWithQuestions(UUID id);
    
    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions qu LEFT JOIN FETCH qu.options WHERE q.id = :id AND q.deleted = false")
    Optional<Quiz> findByIdWithQuestionsAndOptions(UUID id);
}
