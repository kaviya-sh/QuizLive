-- AUTHENTICATION FIX SCRIPT
-- Run this in your Neon database console
-- Database: quizlive_prod
-- URL: https://console.neon.tech

-- Step 1: Check current users
SELECT id, email, role, deleted, 
       SUBSTRING(password_hash, 1, 10) as hash_prefix,
       created_at 
FROM users 
WHERE email IN ('demohost@sparklo.in', 'demo@sparklo.in')
ORDER BY email;

-- Step 2: Update password hashes with BCrypt strength 10
-- Hash for 'demo123' with BCrypt strength 10

-- DEMO HOST
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'demohost@sparklo.in';

-- DEMO PARTICIPANT  
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'demo@sparklo.in';

-- Step 3: Verify updates
SELECT id, email, role, 
       SUBSTRING(password_hash, 1, 10) as hash_prefix,
       updated_at
FROM users 
WHERE email IN ('demohost@sparklo.in', 'demo@sparklo.in')
ORDER BY email;

-- Step 4: If users don't exist, create them
INSERT INTO users (email, password_hash, display_name, role, deleted, created_at, updated_at)
SELECT 'demohost@sparklo.in', 
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO',
       'Demo Host',
       'ROLE_HOST',
       false,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demohost@sparklo.in');

INSERT INTO users (email, password_hash, display_name, role, deleted, created_at, updated_at)
SELECT 'demo@sparklo.in',
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO',
       'Demo Participant',
       'ROLE_PARTICIPANT',
       false,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@sparklo.in');

-- Step 5: Final verification
SELECT 
    email,
    display_name,
    role,
    deleted,
    CASE 
        WHEN password_hash LIKE '$2a$10$%' THEN 'BCrypt-10 ✓'
        WHEN password_hash LIKE '$2a$08$%' THEN 'BCrypt-8 (OLD)'
        ELSE 'Unknown format'
    END as hash_type,
    created_at,
    updated_at
FROM users 
WHERE email IN ('demohost@sparklo.in', 'demo@sparklo.in')
ORDER BY email;

-- EXPECTED RESULT:
-- Both users should show "BCrypt-10 ✓"
-- If they show "BCrypt-8 (OLD)", rerun Step 2
