package com.quizlive.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.quizlive.dto.response.QuizDTO;
import com.quizlive.dto.response.SessionDTO;
import com.quizlive.entity.*;
import com.quizlive.exception.ApiException;
import com.quizlive.repository.*;
import com.quizlive.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {
    
    private final QuizSessionRepository sessionRepository;
    private final QuizRepository quizRepository;
    private final SessionParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final AnswerSubmissionRepository answerRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public SessionDTO createSession(UUID quizId, UUID hostId) {
        // Fetch quiz
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> ApiException.notFound("Quiz not found"));
        
        if (quiz.getDeleted()) {
            throw ApiException.badRequest("Cannot create session for deleted quiz");
        }
        
        // Force initialization of questions and options
        quiz.getQuestions().size();
        quiz.getQuestions().forEach(q -> q.getOptions().size());
        
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> ApiException.notFound("Host not found"));
        
        if (!quiz.getHost().getId().equals(hostId)) {
            throw ApiException.unauthorized("Not authorized to create session for this quiz");
        }
        
        String roomCode = generateRoomCode();
        
        QuizSession session = QuizSession.builder()
                .quiz(quiz)
                .host(host)
                .roomCode(roomCode)
                .status("WAITING")
                .currentQuestionIndex(0)
                .build();
        
        session = sessionRepository.save(session);
        
        // Store in Redis
        try {
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("id", session.getId().toString());
            sessionData.put("roomCode", roomCode);
            sessionData.put("status", "WAITING");
            sessionData.put("currentQuestionIndex", 0);
            sessionData.put("quizId", quizId.toString());
            
            redisTemplate.opsForHash().putAll("session:" + roomCode, sessionData);
            redisTemplate.expire("session:" + roomCode, 24, TimeUnit.HOURS);
        } catch (Exception e) {
            // Log error but don't fail session creation
            System.err.println("Redis error: " + e.getMessage());
        }
        
        return mapToDTO(session);
    }
    
    @Transactional(readOnly = true)
    public SessionDTO getSessionByRoomCode(String roomCode) {
        QuizSession session = sessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Session not found"));
        
        return mapToDTO(session);
    }
    
    @Transactional
    public SessionDTO startSession(String roomCode) {
        QuizSession session = sessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Session not found"));
        
        if (!"WAITING".equals(session.getStatus())) {
            throw ApiException.badRequest("Session already started");
        }
        
        session.setStatus("ACTIVE");
        session.setStartedAt(LocalDateTime.now());
        session = sessionRepository.save(session);
        
        // Update Redis
        redisTemplate.opsForHash().put("session:" + roomCode, "status", "ACTIVE");
        
        // Push first question via WebSocket
        Quiz quiz = quizRepository.findById(session.getQuiz().getId())
                .orElseThrow(() -> ApiException.notFound("Quiz not found"));
        
        // Force initialization
        quiz.getQuestions().size();
        quiz.getQuestions().forEach(q -> q.getOptions().size());
        
        if (!quiz.getQuestions().isEmpty()) {
            Question firstQuestion = quiz.getQuestions().get(0);
            Map<String, Object> questionPayload = buildQuestionPayload(firstQuestion, 0, quiz.getQuestions().size());
            System.out.println("Sending first question to /topic/session/" + roomCode + "/question");
            System.out.println("Question payload: " + questionPayload);
            questionPayload.put("startTime", System.currentTimeMillis());
            messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/question", questionPayload);
        }
        
        return mapToDTO(session);
    }
    
    @Transactional
    public SessionDTO nextQuestion(String roomCode) {
        QuizSession session = sessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Session not found"));
        
        Quiz quiz = quizRepository.findById(session.getQuiz().getId())
                .orElseThrow(() -> ApiException.notFound("Quiz not found"));
        
        // Force initialization
        quiz.getQuestions().size();
        quiz.getQuestions().forEach(q -> q.getOptions().size());
        
        int nextIndex = session.getCurrentQuestionIndex() + 1;
        
        if (nextIndex >= quiz.getQuestions().size()) {
            // End session
            session.setStatus("FINISHED");
            session.setEndedAt(LocalDateTime.now());
            session = sessionRepository.save(session);

            // Clear Redis
            redisTemplate.delete("session:" + roomCode);

            // Notify participants that quiz has ended - send this FIRST
            messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/state",
                    Map.of("status", "FINISHED", "type", "SESSION_ENDED"));

            // Notify host dashboard to refresh
            messagingTemplate.convertAndSend("/topic/host/" + session.getHost().getId() + "/sessions",
                    Map.of("type", "SESSION_FINISHED", "sessionId", session.getId(), "roomCode", roomCode));

            return mapToDTO(session);
        }
        
        session.setCurrentQuestionIndex(nextIndex);
        session = sessionRepository.save(session);
        
        // Update Redis
        redisTemplate.opsForHash().put("session:" + roomCode, "currentQuestionIndex", nextIndex);
        
        // Push next question
        Question nextQuestion = quiz.getQuestions().get(nextIndex);
        Map<String, Object> questionPayload = buildQuestionPayload(nextQuestion, nextIndex, quiz.getQuestions().size());
        questionPayload.put("startTime", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/question", questionPayload);
        
        return mapToDTO(session);
    }
    
    @Transactional
    public void endSession(String roomCode) {
        QuizSession session = sessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Session not found"));

        session.setStatus("FINISHED");
        session.setEndedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // Clear Redis
        redisTemplate.delete("session:" + roomCode);

        // Notify participants that quiz has ended
        messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/state",
                Map.of("status", "FINISHED", "type", "SESSION_ENDED"));

        // Notify host dashboard to refresh session lists
        messagingTemplate.convertAndSend("/topic/host/" + session.getHost().getId() + "/sessions",
                Map.of("type", "SESSION_FINISHED", "sessionId", session.getId(), "roomCode", roomCode));
    }
    
    @Transactional
    public Map<String, Object> joinSession(String roomCode, String displayName, String avatarEmoji, UUID userId) {
        QuizSession session = sessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Session not found"));

        boolean isLateJoiner = "ACTIVE".equals(session.getStatus());
        
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        SessionParticipant participant = SessionParticipant.builder()
                .session(session)
                .user(user)
                .displayName(displayName)
                .avatarEmoji(avatarEmoji)
                .score(0)
                .streak(0)
                .isActive(true)
                .joinedLate(isLateJoiner)
                .spectator(isLateJoiner)
                .build();

        participant = participantRepository.save(participant);

        // Generate guest token
        String guestToken = jwtUtil.generateGuestToken(participant.getId());

        if (isLateJoiner) {
            // Notify host about late joiner
            messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/participants",
                    Map.of("type", "LATE_JOINER", "participant", mapParticipantToDTO(participant)));
        } else {
            // Notify host about new participant
            messagingTemplate.convertAndSend("/topic/session/" + roomCode + "/participants",
                    Map.of("type", "JOINED", "participant", mapParticipantToDTO(participant)));
        }

        Quiz quiz = quizRepository.findById(session.getQuiz().getId())
                .orElseThrow(() -> ApiException.notFound("Quiz not found"));

        return Map.of(
                "participantId", participant.getId(),
                "sessionId", session.getId(),
                "guestToken", guestToken,
                "quizTitle", quiz.getTitle(),
                "status", session.getStatus(),
                "spectator", isLateJoiner
        );
    }
    
    public byte[] generateQRCode(String roomCode) throws Exception {
        String url = "http://localhost:3000/join/" + roomCode;
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        var bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, 300, 300);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getParticipantResults(String roomCode, UUID participantId) {
        QuizSession session = sessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Session not found"));
        
        SessionParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> ApiException.notFound("Participant not found"));
        
        // Get all participants ordered by score
        List<SessionParticipant> allParticipants = participantRepository.findBySessionIdOrderByScoreDesc(session.getId());
        
        // Calculate rank
        int rank = 1;
        for (SessionParticipant p : allParticipants) {
            if (p.getId().equals(participantId)) {
                break;
            }
            rank++;
        }
        
        // Get answer submissions for this participant
        List<AnswerSubmission> submissions = answerRepository.findByParticipantId(participantId);
        int correctAnswers = (int) submissions.stream().filter(AnswerSubmission::getIsCorrect).count();
        int totalQuestions = session.getQuiz().getQuestions().size();
        int accuracy = totalQuestions > 0 ? (correctAnswers * 100 / totalQuestions) : 0;
        
        return Map.of(
                "rank", rank,
                "score", participant.getScore(),
                "totalScore", session.getQuiz().getQuestions().stream()
                        .mapToInt(Question::getPoints).sum(),
                "accuracy", accuracy,
                "correctAnswers", correctAnswers,
                "totalQuestions", totalQuestions
        );
    }
    
    /** New method to get history by user ID for logged-in participants */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getParticipantHistoryByUserId(UUID userId) {
        List<SessionParticipant> participations = participantRepository.findByUserIdOrderByJoinedAtDesc(userId);
        
        List<Map<String, Object>> history = new ArrayList<>();
        
        for (SessionParticipant participant : participations) {
            QuizSession session = participant.getSession();
            
            // Skip if session is not finished
            if (!"FINISHED".equals(session.getStatus())) {
                continue;
            }
            
            List<SessionParticipant> allParticipants = participantRepository.findBySessionIdOrderByScoreDesc(session.getId());

            int rank = 1;
            for (SessionParticipant p : allParticipants) {
                if (p.getId().equals(participant.getId())) break;
                rank++;
            }

            Map<String, Object> entry = new HashMap<>();
            entry.put("sessionId", session.getId());
            entry.put("roomCode", session.getRoomCode());
            entry.put("quizTitle", session.getQuiz().getTitle());
            entry.put("score", participant.getScore());
            entry.put("rank", rank);
            entry.put("totalParticipants", allParticipants.size());
            entry.put("joinedLate", participant.getJoinedLate());
            entry.put("playedAt", session.getEndedAt() != null ? session.getEndedAt().toString() : session.getStartedAt() != null ? session.getStartedAt().toString() : "");
            
            history.add(entry);
        }
        
        // If no history found with user_id, try to find by display name as fallback
        if (history.isEmpty()) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                // Find all finished sessions
                List<QuizSession> finishedSessions = sessionRepository.findAll().stream()
                    .filter(s -> "FINISHED".equals(s.getStatus()))
                    .collect(Collectors.toList());
                
                for (QuizSession session : finishedSessions) {
                    List<SessionParticipant> sessionParticipants = participantRepository.findBySessionId(session.getId());
                    
                    // Try to find participant by display name matching user's display name
                    for (SessionParticipant participant : sessionParticipants) {
                        if (participant.getDisplayName().equalsIgnoreCase(user.getDisplayName())) {
                            List<SessionParticipant> allParticipants = participantRepository.findBySessionIdOrderByScoreDesc(session.getId());

                            int rank = 1;
                            for (SessionParticipant p : allParticipants) {
                                if (p.getId().equals(participant.getId())) break;
                                rank++;
                            }

                            Map<String, Object> entry = new HashMap<>();
                            entry.put("sessionId", session.getId());
                            entry.put("roomCode", session.getRoomCode());
                            entry.put("quizTitle", session.getQuiz().getTitle());
                            entry.put("score", participant.getScore());
                            entry.put("rank", rank);
                            entry.put("totalParticipants", allParticipants.size());
                            entry.put("joinedLate", participant.getJoinedLate());
                            entry.put("playedAt", session.getEndedAt() != null ? session.getEndedAt().toString() : session.getStartedAt() != null ? session.getStartedAt().toString() : "");
                            
                            history.add(entry);
                            break; // Only add once per session
                        }
                    }
                }
            }
        }
        
        return history;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getParticipantHistory(UUID participantId) {
        SessionParticipant participant = participantRepository.findById(participantId)
                .orElse(null);
        
        if (participant == null) {
            return List.of();
        }
        
        // If participant has a user, return all their history
        if (participant.getUser() != null) {
            return getParticipantHistoryByUserId(participant.getUser().getId());
        }

        // Otherwise return just this session
        QuizSession session = participant.getSession();
        List<SessionParticipant> allParticipants = participantRepository.findBySessionIdOrderByScoreDesc(session.getId());

        int rank = 1;
        for (SessionParticipant p : allParticipants) {
            if (p.getId().equals(participantId)) break;
            rank++;
        }

        Map<String, Object> entry = new HashMap<>();
        entry.put("sessionId", session.getId());
        entry.put("roomCode", session.getRoomCode());
        entry.put("quizTitle", session.getQuiz().getTitle());
        entry.put("score", participant.getScore());
        entry.put("rank", rank);
        entry.put("totalParticipants", allParticipants.size());
        entry.put("joinedLate", participant.getJoinedLate());
        entry.put("playedAt", session.getEndedAt() != null ? session.getEndedAt().toString() : session.getStartedAt() != null ? session.getStartedAt().toString() : "");

        return List.of(entry);
    }

    @Transactional(readOnly = true)
    public List<SessionDTO.ParticipantDTO> getLeaderboard(String roomCode) {
        QuizSession session = sessionRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> ApiException.notFound("Session not found"));
        List<SessionParticipant> participants = participantRepository.findBySessionIdOrderByScoreDesc(session.getId());
        return buildRankedLeaderboard(participants);
    }

    private List<SessionDTO.ParticipantDTO> buildRankedLeaderboard(List<SessionParticipant> participants) {
        List<SessionDTO.ParticipantDTO> result = new ArrayList<>();
        for (int i = 0; i < participants.size(); i++) {
            SessionParticipant p = participants.get(i);
            result.add(SessionDTO.ParticipantDTO.builder()
                    .id(p.getId())
                    .displayName(p.getDisplayName())
                    .avatarEmoji(p.getAvatarEmoji())
                    .score(p.getScore())
                    .streak(p.getStreak())
                    .rank(i + 1)
                    .joinedLate(p.getJoinedLate())
                    .build());
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<SessionDTO> getSessionHistory(UUID hostId) {
        List<QuizSession> sessions = sessionRepository.findByHostIdOrderByCreatedAtDesc(hostId);
        
        // Initialize all lazy collections
        sessions.forEach(session -> {
            session.getQuiz().getQuestions().size();
            session.getQuiz().getQuestions().forEach(q -> q.getOptions().size());
        });
        
        return sessions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionDTO> getActiveSessionsByHost(UUID hostId) {
        List<QuizSession> sessions = sessionRepository.findByHostIdAndStatusIn(hostId, List.of("WAITING", "ACTIVE"));
        
        // Initialize all lazy collections
        sessions.forEach(session -> {
            session.getQuiz().getQuestions().size();
            session.getQuiz().getQuestions().forEach(q -> q.getOptions().size());
        });
        
        return sessions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
    
    private Map<String, Object> buildQuestionPayload(Question question, int index, int total) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "QUESTION_START");
        payload.put("id", question.getId());
        payload.put("text", question.getText());
        payload.put("imageUrl", question.getImageUrl());
        payload.put("timeLimitSeconds", question.getTimeLimitSeconds());
        payload.put("points", question.getPoints());
        payload.put("questionIndex", index);
        payload.put("totalQuestions", total);
        payload.put("options", question.getOptions().stream()
                .map(o -> Map.of("id", o.getId(), "text", o.getText()))
                .collect(Collectors.toList()));
        return payload;
    }
    
    private SessionDTO mapToDTO(QuizSession session) {
        List<SessionParticipant> participants = participantRepository.findBySessionIdAndIsActiveTrue(session.getId());
        
        Quiz quiz = session.getQuiz();
        
        // Get current question if session is active
        QuizDTO.QuestionDTO currentQuestionDTO = null;
        if ("ACTIVE".equals(session.getStatus())) {
            if (quiz != null && quiz.getQuestions() != null && 
                session.getCurrentQuestionIndex() < quiz.getQuestions().size()) {
                Question currentQuestion = quiz.getQuestions().get(session.getCurrentQuestionIndex());
                currentQuestionDTO = mapQuestionToDTO(currentQuestion);
            }
        }
        
        // Map quiz to DTO
        QuizDTO quizDTO = QuizDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .category(quiz.getCategory())
                .questions(quiz.getQuestions().stream()
                        .map(this::mapQuestionToDTO)
                        .collect(Collectors.toList()))
                .build();
        
        return SessionDTO.builder()
                .id(session.getId())
                .roomCode(session.getRoomCode())
                .status(session.getStatus())
                .currentQuestionIndex(session.getCurrentQuestionIndex())
                .currentQuestion(currentQuestionDTO)
                .quiz(quizDTO)
                .participantCount(participants.size())
                .participants(participants.stream()
                        .map(this::mapParticipantToDTO)
                        .collect(Collectors.toList()))
                .startTime(session.getStartedAt() != null ?
                        session.getStartedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : null)
                .endTime(session.getEndedAt() != null ?
                        session.getEndedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : null)
                .durationSeconds(session.getStartedAt() != null && session.getEndedAt() != null ?
                        java.time.Duration.between(session.getStartedAt(), session.getEndedAt()).getSeconds() : null)
                .build();
    }
    
    private QuizDTO.QuestionDTO mapQuestionToDTO(Question question) {
        return QuizDTO.QuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .imageUrl(question.getImageUrl())
                .timeLimitSeconds(question.getTimeLimitSeconds())
                .points(question.getPoints())
                .options(question.getOptions().stream()
                        .map(o -> QuizDTO.OptionDTO.builder()
                                .id(o.getId())
                                .text(o.getText())
                                .isCorrect(o.getIsCorrect())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
    
    private SessionDTO.ParticipantDTO mapParticipantToDTO(SessionParticipant participant) {
        return SessionDTO.ParticipantDTO.builder()
                .id(participant.getId())
                .displayName(participant.getDisplayName())
                .avatarEmoji(participant.getAvatarEmoji())
                .score(participant.getScore())
                .streak(participant.getStreak())
                .rank(participant.getRank())
                .joinedLate(participant.getJoinedLate())
                .build();
    }
}
