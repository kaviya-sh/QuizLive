-- ========================================
-- CORRECT Demo Users Setup
-- ========================================
-- Password: demo123
-- BCrypt hash (strength 10): $2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2

-- Demo Participant User
INSERT INTO users (email, password_hash, display_name, role, created_at, updated_at, deleted)
VALUES (
    'demo@sparklo.in',
    '$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2',
    'Demo Participant',
    'ROLE_PARTICIPANT',
    NOW(),
    NOW(),
    false
)
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Demo Host User
INSERT INTO users (email, password_hash, display_name, role, created_at, updated_at, deleted)
VALUES (
    'demohost@sparklo.in',
    '$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2',
    'Demo Host',
    'ROLE_HOST',
    NOW(),
    NOW(),
    false
)
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verify the users were created
SELECT 
    id, 
    email, 
    display_name, 
    role, 
    deleted,
    created_at 
FROM users 
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');
