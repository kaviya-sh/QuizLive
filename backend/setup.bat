@echo off
echo ========================================
echo QuizLive Backend Setup (Windows)
echo ========================================
echo.

REM Check if .env exists
if exist .env (
    echo [OK] .env file found
) else (
    echo [WARNING] .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [IMPORTANT] Edit .env file and add your email credentials!
    echo.
    echo For Gmail:
    echo 1. Enable 2FA: https://myaccount.google.com/security
    echo 2. Generate App Password: https://myaccount.google.com/apppasswords
    echo 3. Update MAIL_USERNAME and MAIL_PASSWORD in .env
    echo.
    pause
)

echo.
echo Loading environment variables from .env...

REM Read .env file and set variables
for /f "tokens=1,2 delims==" %%a in (.env) do (
    set %%a=%%b
)

echo [OK] Environment variables loaded
echo.
echo Building project...
call mvn clean package -DskipTests

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Build successful!
    echo.
    echo Starting application...
    echo.
    java -jar target\quizlive-backend-1.0.0.jar
) else (
    echo.
    echo [ERROR] Build failed. Please check the errors above.
    pause
    exit /b 1
)
