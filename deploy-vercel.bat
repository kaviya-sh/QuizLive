@echo off
echo ========================================
echo   Quiz System - Vercel Deployment
echo ========================================
echo.

cd /d "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive\frontend"

echo Checking if Vercel CLI is installed...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    echo.
)

echo.
echo Building the project...
call npm run build

echo.
echo Deploying to Vercel...
vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your site should be live at the URL shown above.
echo.
pause
