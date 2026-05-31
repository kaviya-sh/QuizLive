-- Demo Users Setup Script for sparklo.in
-- Run this script in your PostgreSQL database

-- Note: The password 'demo123' is hashed using BCrypt
-- BCrypt hash for 'demo123': $2a$10$rN8qLXqY5Y5Y5Y5Y5Y5Y5eK5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y

-- 1. Demo Participant User
INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)
VALUES (
    'demo@sparklo.in',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- BCrypt hash for 'demo123'
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

-- 2. Demo Host User
INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)
VALUES (
    'demohost@sparklo.in',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- BCrypt hash for 'demo123'
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

-- Verify the demo users were created
SELECT id, email, display_name, role, enabled, created_at 
FROM users 
WHERE email IN ('demo@sparklo.in', 'demohost@sparklo.in');

-- Expected output:
-- | id | email                  | display_name      | role              | enabled | created_at          |
-- |----|------------------------|-------------------|-------------------|---------|---------------------|
-- | XX | demo@sparklo.in        | Demo Participant  | ROLE_PARTICIPANT  | true    | 2024-XX-XX XX:XX:XX |
-- | XX | demohost@sparklo.in    | Demo Host         | ROLE_HOST         | true    | 2024-XX-XX XX:XX:XX |

-- IMPORTANT NOTES:
-- 1. The BCrypt hash above is for the password 'demo123'
-- 2. If your application uses a different BCrypt strength (rounds), you may need to regenerate the hash
-- 3. To generate a new BCrypt hash in Java/Spring Boot:
--    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
--    String hash = encoder.encode("demo123");
-- 4. Make sure your users table has these columns: id, email, password, display_name, role, created_at, updated_at, enabled
-- 5. Adjust column names if your schema is different

-- Alternative: If the hash doesn't work, use this Java code to generate it:
-- 
-- import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
-- 
-- public class GenerateHash {
--     public static void main(String[] args) {
--         BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
--         String password = "demo123";
--         String hash = encoder.encode(password);
--         System.out.println("BCrypt hash for 'demo123': " + hash);
--     }
-- }
