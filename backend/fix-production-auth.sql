-- Fix Production Authentication Issues
-- Run this script on your production database

-- 1. Check current users
SELECT id, email, role, deleted, 
       SUBSTRING(password_hash, 1, 10) as hash_prefix,
       LENGTH(password_hash) as hash_length
FROM users 
WHERE deleted = false;

-- 2. Update demo users with properly hashed passwords
-- Password: demo123
-- BCrypt hash (default strength)
UPDATE users 
SET password_hash = '$2a$10$YourActualBCryptHashForDemo123'
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in')
AND deleted = false;

-- 3. Verify users table structure
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'password_hash';

-- 4. Check for any orphaned sessions
DELETE FROM quiz_sessions 
WHERE created_at < NOW() - INTERVAL '7 days'
AND status NOT IN ('COMPLETED', 'ENDED');

-- 5. Clean up expired OTPs
UPDATE users 
SET otp = NULL, otp_generated_time = NULL 
WHERE otp_generated_time < NOW() - INTERVAL '1 hour';
