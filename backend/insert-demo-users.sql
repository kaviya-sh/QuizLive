-- ========================================
-- Demo Users Setup - Ready to Use
-- ========================================
-- Password for both users: demo123
-- BCrypt hash (10 rounds): $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- This is a standard BCrypt hash for 'password' - you should regenerate for 'demo123'
-- But you can test with this first, then update later

-- ========================================
-- Option 1: Use this pre-generated hash
-- ========================================

-- Demo Participant User
INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)
VALUES (
    'demo@sparklo.in',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Demo Participant',
    'ROLE_PARTICIPANT',
    NOW(),
    NOW(),
    true
)
ON CONFLICT (email) DO UPDATE SET 
    password = EXCLUDED.password,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Demo Host User
INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)
VALUES (
    'demohost@sparklo.in',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Demo Host',
    'ROLE_HOST',
    NOW(),
    NOW(),
    true
)
ON CONFLICT (email) DO UPDATE SET 
    password = EXCLUDED.password,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- ========================================
-- Verify the users were created
-- ========================================
SELECT 
    id, 
    email, 
    display_name, 
    role, 
    enabled, 
    created_at 
FROM users 
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');

-- ========================================
-- IMPORTANT: Generate proper BCrypt hash
-- ========================================
-- The hash above is a standard test hash.
-- To generate the correct hash for 'demo123':
--
-- Method 1: Use online generator
-- 1. Go to: https://bcrypt-generator.com/
-- 2. Enter: demo123
-- 3. Rounds: 10
-- 4. Copy the hash
-- 5. Update both users with:
--
-- UPDATE users SET password = 'YOUR_NEW_HASH' WHERE email = 'demo@sparklo.in';
-- UPDATE users SET password = 'YOUR_NEW_HASH' WHERE email = 'demohost@sparklo.in';
--
-- Method 2: Use Spring Boot endpoint
-- Add this to a controller:
-- @GetMapping("/api/generate-hash")
-- public String generateHash() {
--     BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
--     return encoder.encode("demo123");
-- }
--
-- Then visit: http://localhost:8081/api/generate-hash

-- ========================================
-- Test the login
-- ========================================
-- After running this SQL:
-- 1. Go to your login page
-- 2. Click "Demo Participant" button
-- 3. Try to login
-- 4. If it fails with "Invalid password", generate a new hash using methods above
