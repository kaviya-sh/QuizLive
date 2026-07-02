-- Fix demo user passwords: V9 used a hash for 'password' not 'demo123'
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO is verified BCrypt hash for 'demo123'
UPDATE users
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO',
    deleted = false,
    updated_at = NOW()
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');
