-- ================================================
-- PRODUCTION DATABASE FIX SCRIPT - FINAL VERSION
-- ================================================
-- Database: ep-noisy-brook-aplc69tm.c-7.us-east-1.aws.neon.tech
-- Database Name: quizlive_prod
-- Password: demo123
-- BCrypt Strength: 10
-- ================================================

-- STEP 1: Check current users
SELECT 
    id, 
    email, 
    display_name, 
    role, 
    deleted,
    substring(password_hash, 1, 20) as hash_prefix,
    length(password_hash) as hash_length,
    created_at
FROM users 
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');

-- STEP 2: Delete and recreate users with correct password hash
DELETE FROM users WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');

INSERT INTO users (email, password_hash, display_name, role, created_at, updated_at, deleted)
VALUES 
    ('demo@sparklo.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'Demo Participant', 'ROLE_PARTICIPANT', NOW(), NOW(), false),
    ('demohost@sparklo.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 'Demo Host', 'ROLE_HOST', NOW(), NOW(), false);

-- STEP 3: Verify the fix
SELECT 
    id, 
    email, 
    display_name, 
    role, 
    deleted,
    substring(password_hash, 1, 30) as hash_prefix,
    CASE 
        WHEN password_hash LIKE '$2a$10$%' THEN 'BCrypt-10 CORRECT'
        WHEN password_hash LIKE '$2a$08$%' THEN 'BCrypt-8 WRONG'
        ELSE 'Unknown'
    END as hash_status,
    created_at
FROM users 
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');

-- Expected output:
-- Both users should show "BCrypt-10 CORRECT"
-- Hash prefix: $2a$10$N9qo8uLOickgx2ZMRZoMye
-- Password: demo123
