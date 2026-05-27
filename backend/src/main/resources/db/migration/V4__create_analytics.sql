CREATE INDEX idx_answer_session_question ON answer_submissions(session_id, question_id);
CREATE INDEX idx_answer_participant_correct ON answer_submissions(participant_id, is_correct);
CREATE INDEX idx_sessions_host_created ON quiz_sessions(host_id, created_at DESC);
CREATE INDEX idx_participants_score ON session_participants(session_id, score DESC);
