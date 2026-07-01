-- Fix demo user passwords with a known valid BCrypt hash for 'demo123'
-- This runs once via Flyway to ensure demo users have a stable password hash
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO',
    deleted = false,
    updated_at = NOW()
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');
