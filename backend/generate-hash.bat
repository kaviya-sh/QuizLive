@echo off
echo ========================================
echo   Password Hash Generator
echo ========================================
echo.

cd /d "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive\backend"

echo Compiling PasswordHashGenerator...
javac -cp "target/classes;target/quiz-api-1.0.0.jar" src/main/java/com/quizlive/util/PasswordHashGenerator.java

if errorlevel 1 (
    echo.
    echo Compilation failed. Trying alternative method...
    echo.
    echo Please use this online BCrypt generator instead:
    echo https://bcrypt-generator.com/
    echo.
    echo Password: demo123
    echo Rounds: 10
    echo.
    echo Then use the generated hash in the SQL below:
    echo.
    goto :manual
)

echo.
echo Running PasswordHashGenerator...
echo.
java -cp "src/main/java;target/classes;target/quiz-api-1.0.0.jar" com.quizlive.util.PasswordHashGenerator

if errorlevel 1 (
    goto :manual
)

echo.
pause
exit /b 0

:manual
echo ========================================
echo   Manual SQL Template
echo ========================================
echo.
echo Use this SQL with the BCrypt hash from https://bcrypt-generator.com/
echo.
echo -- Demo Participant
echo INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)
echo VALUES ('demo@sparklo.in', 'PASTE_BCRYPT_HASH_HERE', 'Demo Participant', 'ROLE_PARTICIPANT', NOW(), NOW(), true)
echo ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
echo.
echo -- Demo Host
echo INSERT INTO users (email, password, display_name, role, created_at, updated_at, enabled)
echo VALUES ('demohost@sparklo.in', 'PASTE_BCRYPT_HASH_HERE', 'Demo Host', 'ROLE_HOST', NOW(), NOW(), true)
echo ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
echo.
pause
