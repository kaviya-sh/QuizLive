CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_code VARCHAR(6) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'WAITING',
    current_question_index INT DEFAULT 0,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    avatar_emoji VARCHAR(10),
    score INT DEFAULT 0,
    streak INT DEFAULT 0,
    rank INT,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE answer_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES options(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    points_earned INT DEFAULT 0,
    answered_at_ms BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_room_code ON quiz_sessions(room_code);
CREATE INDEX idx_sessions_status ON quiz_sessions(status);
CREATE INDEX idx_participants_session ON session_participants(session_id);
CREATE INDEX idx_answers_session ON answer_submissions(session_id);
CREATE INDEX idx_answers_participant ON answer_submissions(participant_id);
CREATE INDEX idx_answers_question ON answer_submissions(question_id);
