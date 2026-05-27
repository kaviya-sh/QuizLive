CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    cover_image_url VARCHAR(500),
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    time_limit_seconds INT DEFAULT 30,
    points INT DEFAULT 100,
    speed_bonus_enabled BOOLEAN DEFAULT true,
    order_index INT NOT NULL
);

CREATE TABLE options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INT NOT NULL
);

CREATE TABLE quiz_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    question_count INT DEFAULT 0
);

CREATE INDEX idx_quizzes_host ON quizzes(host_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_options_question ON options(question_id);
