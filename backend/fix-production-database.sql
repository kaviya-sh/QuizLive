-- ================================================
-- PRODUCTION DATABASE FIX SCRIPT
-- ================================================
-- Database: ep-noisy-brook-aplc69tm.c-7.us-east-1.aws.neon.tech
-- Database Name: quizlive_prod
-- ================================================

-- STEP 1: Check if users exist
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

-- STEP 2: If users don't exist or have wrong hash, run this:
-- This will INSERT new users or UPDATE existing ones with correct password

INSERT INTO users (email, password_hash, display_name, role, created_at, updated_at, deleted)
VALUES 
    ('demo@sparklo.in', '$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2', 'Demo Participant', 'ROLE_PARTICIPANT', NOW(), NOW(), false),
    ('demohost@sparklo.in', '$2a$10$ZtiYs7oR1i571MkFyrGKwOOhqWm0VgC91nYFMbeXvIPyp5aOXtoL2', 'Demo Host', 'ROLE_HOST', NOW(), NOW(), false)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    deleted = false,
    updated_at = NOW();

-- STEP 3: Verify the fix
SELECT 
    id, 
    email, 
    display_name, 
    role, 
    deleted,
    substring(password_hash, 1, 30) as hash_prefix,
    created_at
FROM users 
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');

-- Expected hash prefix: $2a$10$ZtiYs7oR1i571MkFyrGK
-- Password: demo123

-- ================================================
-- CONNECTION COMMAND (use this to connect):
-- ================================================
-- psql "postgresql://neondb_owner:npg_Wd59yJgvZpXT@ep-noisy-brook-aplc69tm.c-7.us-east-1.aws.neon.tech/quizlive_prod?sslmode=require"
-- ================================================
