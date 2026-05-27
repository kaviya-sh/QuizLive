package com.quizlive.service;

import com.quizlive.dto.response.QuizDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AIService {
    
    public List<QuizDTO.QuestionDTO> suggestQuestions(String topic) {
        // TODO: Integrate with external AI API (OpenAI, etc.)
        // For now, return mock data
        List<QuizDTO.QuestionDTO> questions = new ArrayList<>();
        
        for (int i = 1; i <= 5; i++) {
            List<QuizDTO.OptionDTO> options = new ArrayList<>();
            for (int j = 1; j <= 4; j++) {
                options.add(QuizDTO.OptionDTO.builder()
                        .id(UUID.randomUUID())
                        .text("Option " + j + " for " + topic)
                        .isCorrect(j == 1)
                        .orderIndex(j - 1)
                        .build());
            }
            
            questions.add(QuizDTO.QuestionDTO.builder()
                    .id(UUID.randomUUID())
                    .type("MCQ")
                    .text("AI Generated Question " + i + " about " + topic + "?")
                    .timeLimitSeconds(30)
                    .points(100)
                    .speedBonusEnabled(true)
                    .orderIndex(i - 1)
                    .options(options)
                    .build());
        }
        
        return questions;
    }
    
    public List<String> suggestOptions(String questionText) {
        // TODO: Integrate with external AI API
        return List.of(
                "Option A",
                "Option B",
                "Option C",
                "Option D"
        );
    }
}
