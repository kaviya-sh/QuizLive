-- Definitive fix: set verified BCrypt(10) hash for 'demo123' on demo users
-- Hash: $2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2
-- Upsert so it works whether users exist or not
INSERT INTO users (id, email, password_hash, display_name, role, deleted, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'demo@sparklo.in',     '$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2', 'Demo Participant', 'ROLE_PARTICIPANT', false, NOW(), NOW()),
  (uuid_generate_v4(), 'demohost@sparklo.in', '$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2', 'Demo Host',        'ROLE_HOST',        false, NOW(), NOW())
ON CONFLICT (email) DO UPDATE
  SET password_hash = '$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2',
      deleted       = false,
      updated_at    = NOW();
