-- Fix demo user passwords: use verified BCrypt(10) hash for 'demo123'
UPDATE users
SET password_hash = '$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2',
    deleted = false,
    updated_at = NOW()
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');
