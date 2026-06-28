package com.quizlive.service;

import com.quizlive.dto.request.CreateQuizRequest;
import com.quizlive.dto.response.QuizDTO;
import com.quizlive.entity.*;
import com.quizlive.exception.ApiException;
import com.quizlive.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {
    
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public QuizDTO createQuiz(CreateQuizRequest request, UUID hostId) {
        log.info("Creating quiz - Title: {}, Questions: {}", request.getTitle(), 
            request.getQuestions() != null ? request.getQuestions().size() : 0);
        
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> ApiException.notFound("Host not found"));
        
        Quiz quiz = Quiz.builder()
                .host(host)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .coverImageUrl(request.getCoverImageUrl())
                .language(request.getLanguage())
                .status("DRAFT")
                .questions(new ArrayList<>())
                .deleted(false)
                .build();
        
        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            for (CreateQuizRequest.QuestionRequest qReq : request.getQuestions()) {
                log.debug("Adding question: {}, Options: {}", qReq.getText(), 
                    qReq.getOptions() != null ? qReq.getOptions().size() : 0);
                
                Question question = Question.builder()
                        .quiz(quiz)
                        .type(qReq.getType())
                        .text(qReq.getText())
                        .imageUrl(qReq.getImageUrl())
                        .timeLimitSeconds(qReq.getTimeLimitSeconds())
                        .points(qReq.getPoints())
                        .speedBonusEnabled(qReq.getSpeedBonusEnabled())
                        .orderIndex(qReq.getOrderIndex())
                        .options(new ArrayList<>())
                        .build();
                
                if (qReq.getOptions() != null && !qReq.getOptions().isEmpty()) {
                    for (CreateQuizRequest.OptionRequest oReq : qReq.getOptions()) {
                        if (oReq.getText() != null && !oReq.getText().trim().isEmpty()) {
                            Option option = Option.builder()
                                    .question(question)
                                    .text(oReq.getText())
                                    .isCorrect(oReq.getIsCorrect())
                                    .orderIndex(oReq.getOrderIndex())
                                    .build();
                            question.getOptions().add(option);
                        }
                    }
                }
                
                quiz.getQuestions().add(question);
            }
        }
        
        quiz = quizRepository.save(quiz);
        log.info("Quiz created successfully - ID: {}", quiz.getId());
        return mapToDTO(quiz);
    }
    
    @Transactional(readOnly = true)
    public Page<QuizDTO> getHostQuizzes(UUID hostId, Pageable pageable) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> ApiException.notFound("Host not found"));
        
        Page<Quiz> quizzes = quizRepository.findByHostAndDeletedFalse(host, pageable);
        
        // Initialize lazy collections within transaction
        quizzes.forEach(quiz -> {
            quiz.getQuestions().size();
            quiz.getQuestions().forEach(q -> q.getOptions().size());
        });
        
        return quizzes.map(this::mapToDTO);
    }
    
    @Transactional(readOnly = true)
    public QuizDTO getQuizById(UUID quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> ApiException.notFound("Quiz not found"));
        
        if (quiz.getDeleted()) {
            throw ApiException.notFound("Quiz not found");
        }
        
        // Force initialization within transaction
        quiz.getQuestions().size();
        quiz.getQuestions().forEach(q -> {
            q.getOptions().size();
        });
        
        return mapToDTO(quiz);
    }
    
    @Transactional
    public QuizDTO updateQuiz(UUID quizId, CreateQuizRequest request, UUID hostId) {
        log.info("Updating quiz: {}", quizId);
        
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> ApiException.notFound("Quiz not found"));
        
        if (!quiz.getHost().getId().equals(hostId)) {
            throw ApiException.unauthorized("Not authorized to update this quiz");
        }
        
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(request.getCategory());
        quiz.setCoverImageUrl(request.getCoverImageUrl());
        quiz.setLanguage(request.getLanguage());
        
        quiz.getQuestions().clear();
        
        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            for (CreateQuizRequest.QuestionRequest qReq : request.getQuestions()) {
                Question question = Question.builder()
                        .quiz(quiz)
                        .type(qReq.getType())
                        .text(qReq.getText())
                        .imageUrl(qReq.getImageUrl())
                        .timeLimitSeconds(qReq.getTimeLimitSeconds())
                        .points(qReq.getPoints())
                        .speedBonusEnabled(qReq.getSpeedBonusEnabled())
                        .orderIndex(qReq.getOrderIndex())
                        .options(new ArrayList<>())
                        .build();
                
                if (qReq.getOptions() != null && !qReq.getOptions().isEmpty()) {
                    for (CreateQuizRequest.OptionRequest oReq : qReq.getOptions()) {
                        if (oReq.getText() != null && !oReq.getText().trim().isEmpty()) {
                            Option option = Option.builder()
                                    .question(question)
                                    .text(oReq.getText())
                                    .isCorrect(oReq.getIsCorrect())
                                    .orderIndex(oReq.getOrderIndex())
                                    .build();
                            question.getOptions().add(option);
                        }
                    }
                }
                
                quiz.getQuestions().add(question);
            }
        }
        
        quiz = quizRepository.save(quiz);
        log.info("Quiz updated successfully");
        return mapToDTO(quiz);
    }
    
    @Transactional
    public void deleteQuiz(UUID quizId, UUID hostId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> ApiException.notFound("Quiz not found"));
        
        if (!quiz.getHost().getId().equals(hostId)) {
            throw ApiException.unauthorized("Not authorized to delete this quiz");
        }
        
        quiz.setDeleted(true);
        quizRepository.save(quiz);
    }
    
    @Transactional
    public QuizDTO publishQuiz(UUID quizId, UUID hostId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> ApiException.notFound("Quiz not found"));
        
        if (!quiz.getHost().getId().equals(hostId)) {
            throw ApiException.unauthorized("Not authorized to publish this quiz");
        }
        
        quiz.setStatus("PUBLISHED");
        quiz = quizRepository.save(quiz);
        return mapToDTO(quiz);
    }
    
    private QuizDTO mapToDTO(Quiz quiz) {
        return QuizDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .category(quiz.getCategory())
                .coverImageUrl(quiz.getCoverImageUrl())
                .language(quiz.getLanguage())
                .status(quiz.getStatus())
                .questions(quiz.getQuestions().stream()
                        .map(this::mapQuestionToDTO)
                        .collect(Collectors.toList()))
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
    }
    
    private QuizDTO.QuestionDTO mapQuestionToDTO(Question question) {
        return QuizDTO.QuestionDTO.builder()
                .id(question.getId())
                .type(question.getType())
                .text(question.getText())
                .imageUrl(question.getImageUrl())
                .timeLimitSeconds(question.getTimeLimitSeconds())
                .points(question.getPoints())
                .speedBonusEnabled(question.getSpeedBonusEnabled())
                .orderIndex(question.getOrderIndex())
                .options(question.getOptions().stream()
                        .map(this::mapOptionToDTO)
                        .collect(Collectors.toList()))
                .build();
    }
    
    private QuizDTO.OptionDTO mapOptionToDTO(Option option) {
        return QuizDTO.OptionDTO.builder()
                .id(option.getId())
                .text(option.getText())
                .isCorrect(option.getIsCorrect())
                .orderIndex(option.getOrderIndex())
                .build();
    }
}
