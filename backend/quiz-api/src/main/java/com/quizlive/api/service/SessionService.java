package com.quizlive.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizlive.api.dto.SessionDto;
import com.quizlive.core.entity.*;
import com.quizlive.core.model.*;
import com.quizlive.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final QuizRepository quizRepository;
    private final SessionResultRepository sessionResultRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public SessionDto.CreateResponse createSession(Long quizId) {
        Quiz quiz = quizRepository.findByIdWithQuestionsAndAnswers(quizId);
        if (quiz == null) throw new RuntimeException("Quiz not found");

        String roomCode = generateRoomCode();
        SessionState state = SessionState.builder()
            .roomCode(roomCode)
            .quizId(quizId)
            .status(SessionStatus.WAITING)
            .currentQuestionIndex(-1)
            .build();

        redisTemplate.opsForValue().set("session:" + roomCode, state, 24, TimeUnit.HOURS);
        return SessionDto.CreateResponse.builder().roomCode(roomCode).status(SessionStatus.WAITING).build();
    }

    public SessionDto.StateResponse getSessionState(String roomCode) {
        SessionState state = getState(roomCode);
        Quiz quiz = quizRepository.findByIdWithQuestionsAndAnswers(state.getQuizId());

        SessionDto.QuestionData currentQuestion = null;
        if (state.getCurrentQuestionIndex() >= 0 && state.getCurrentQuestionIndex() < quiz.getQuestions().size()) {
            Question q = quiz.getQuestions().get(state.getCurrentQuestionIndex());
            currentQuestion = SessionDto.QuestionData.builder()
                .id(q.getId())
                .text(q.getText())
                .timeLimit(q.getTimeLimit())
                .points(q.getPoints())
                .answers(q.getAnswers().stream()
                    .map(a -> SessionDto.AnswerOption.builder().id(a.getId()).text(a.getText()).build())
                    .collect(Collectors.toList()))
                .build();
        }

        return SessionDto.StateResponse.builder()
            .roomCode(roomCode)
            .status(state.getStatus())
            .currentQuestionIndex(state.getCurrentQuestionIndex())
            .participantCount(state.getParticipants().size())
            .currentQuestion(currentQuestion)
            .answerDistribution(state.getAnswerDistribution())
            .build();
    }

    public void startSession(String roomCode) {
        SessionState state = getState(roomCode);
        Quiz quiz = quizRepository.findByIdWithQuestionsAndAnswers(state.getQuizId());
        
        state.setStatus(SessionStatus.ACTIVE);
        state.setCurrentQuestionIndex(0);
        state.setCurrentQuestionId(quiz.getQuestions().get(0).getId());
        state.setQuestionStartTime(System.currentTimeMillis());
        state.setAnswerDistribution(new HashMap<>());
        saveState(roomCode, state);

        Question q = quiz.getQuestions().get(0);
        messagingTemplate.convertAndSend("/topic/session/" + roomCode, Map.of(
            "type", "QUESTION_START",
            "question", buildQuestionData(q),
            "questionIndex", 0,
            "totalQuestions", quiz.getQuestions().size()
        ));
    }

    public void nextQuestion(String roomCode) {
        SessionState state = getState(roomCode);
        Quiz quiz = quizRepository.findByIdWithQuestionsAndAnswers(state.getQuizId());
        
        calculateScores(state, quiz);
        
        int nextIndex = state.getCurrentQuestionIndex() + 1;
        if (nextIndex >= quiz.getQuestions().size()) {
            state.setStatus(SessionStatus.FINISHED);
            saveState(roomCode, state);
            
            List<SessionDto.LeaderboardEntry> leaderboard = buildLeaderboard(state);
            messagingTemplate.convertAndSend("/topic/session/" + roomCode, Map.of(
                "type", "SESSION_END",
                "leaderboard", leaderboard
            ));
        } else {
            state.setCurrentQuestionIndex(nextIndex);
            state.setCurrentQuestionId(quiz.getQuestions().get(nextIndex).getId());
            state.setQuestionStartTime(System.currentTimeMillis());
            state.setAnswerDistribution(new HashMap<>());
            state.getParticipants().values().forEach(p -> {
                p.setAnsweredAt(null);
                p.setAnswerId(null);
            });
            saveState(roomCode, state);

            Question q = quiz.getQuestions().get(nextIndex);
            messagingTemplate.convertAndSend("/topic/session/" + roomCode, Map.of(
                "type", "QUESTION_START",
                "question", buildQuestionData(q),
                "questionIndex", nextIndex,
                "totalQuestions", quiz.getQuestions().size()
            ));
        }
    }

    @Transactional
    public void endSession(String roomCode) {
        SessionState state = getState(roomCode);
        Quiz quiz = quizRepository.findByIdWithQuestionsAndAnswers(state.getQuizId());
        
        calculateScores(state, quiz);
        
        state.getParticipants().values().forEach(p -> {
            SessionResult result = SessionResult.builder()
                .roomCode(roomCode)
                .quizId(state.getQuizId())
                .participantName(p.getDisplayName())
                .totalScore(p.getTotalScore())
                .correctAnswers(p.getCorrectAnswers())
                .totalQuestions(quiz.getQuestions().size())
                .build();
            sessionResultRepository.save(result);
        });

        redisTemplate.delete("session:" + roomCode);
        
        messagingTemplate.convertAndSend("/topic/session/" + roomCode, Map.of(
            "type", "SESSION_END",
            "leaderboard", buildLeaderboard(state)
        ));
    }

    public void removeParticipant(String roomCode, String participantId) {
        SessionState state = getState(roomCode);
        state.getParticipants().remove(participantId);
        saveState(roomCode, state);
        
        messagingTemplate.convertAndSend("/topic/session/" + roomCode, Map.of(
            "type", "PARTICIPANT_LEFT",
            "participantId", participantId
        ));
    }

    public List<SessionDto.ParticipantDto> getParticipants(String roomCode) {
        SessionState state = getState(roomCode);
        return state.getParticipants().values().stream()
            .map(p -> SessionDto.ParticipantDto.builder()
                .participantId(p.getParticipantId())
                .displayName(p.getDisplayName())
                .totalScore(p.getTotalScore())
                .build())
            .collect(Collectors.toList());
    }

    private void calculateScores(SessionState state, Quiz quiz) {
        Question question = quiz.getQuestions().stream()
            .filter(q -> q.getId().equals(state.getCurrentQuestionId()))
            .findFirst().orElse(null);
        
        if (question == null) return;

        Long correctAnswerId = question.getAnswers().stream()
            .filter(Answer::getIsCorrect)
            .map(Answer::getId)
            .findFirst().orElse(null);

        state.getParticipants().values().forEach(p -> {
            if (p.getAnswerId() != null && p.getAnswerId().equals(correctAnswerId)) {
                long responseTime = p.getAnsweredAt() - state.getQuestionStartTime();
                int timeBonus = Math.max(0, (int)(question.getPoints() * (1 - responseTime / (question.getTimeLimit() * 1000.0))));
                p.setTotalScore((p.getTotalScore() == null ? 0 : p.getTotalScore()) + question.getPoints() + timeBonus);
                p.setCorrectAnswers((p.getCorrectAnswers() == null ? 0 : p.getCorrectAnswers()) + 1);
            }
        });
    }

    private List<SessionDto.LeaderboardEntry> buildLeaderboard(SessionState state) {
        List<ParticipantState> sorted = new ArrayList<>(state.getParticipants().values());
        sorted.sort((a, b) -> Integer.compare(
            b.getTotalScore() == null ? 0 : b.getTotalScore(),
            a.getTotalScore() == null ? 0 : a.getTotalScore()
        ));

        List<SessionDto.LeaderboardEntry> leaderboard = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            ParticipantState p = sorted.get(i);
            leaderboard.add(SessionDto.LeaderboardEntry.builder()
                .displayName(p.getDisplayName())
                .totalScore(p.getTotalScore() == null ? 0 : p.getTotalScore())
                .correctAnswers(p.getCorrectAnswers() == null ? 0 : p.getCorrectAnswers())
                .rank(i + 1)
                .build());
        }
        return leaderboard;
    }

    private Map<String, Object> buildQuestionData(Question q) {
        return Map.of(
            "id", q.getId(),
            "text", q.getText(),
            "timeLimit", q.getTimeLimit(),
            "answers", q.getAnswers().stream()
                .map(a -> Map.of("id", a.getId(), "text", a.getText()))
                .collect(Collectors.toList())
        );
    }

    private SessionState getState(String roomCode) {
        Object obj = redisTemplate.opsForValue().get("session:" + roomCode);
        if (obj == null) throw new RuntimeException("Session not found");
        return objectMapper.convertValue(obj, SessionState.class);
    }

    private void saveState(String roomCode, SessionState state) {
        redisTemplate.opsForValue().set("session:" + roomCode, state, 24, TimeUnit.HOURS);
    }

    private String generateRoomCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
}
