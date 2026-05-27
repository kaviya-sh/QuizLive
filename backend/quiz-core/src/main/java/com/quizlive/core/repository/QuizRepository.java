package com.quizlive.core.repository;

import com.quizlive.core.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions qu LEFT JOIN FETCH qu.answers WHERE q.id = :id")
    Quiz findByIdWithQuestionsAndAnswers(Long id);
}
