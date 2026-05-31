@echo off
echo ========================================
echo   sparklo.in - GitHub Deployment
echo ========================================
echo.

cd /d "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive"

echo Checking Git status...
git status
echo.

set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=feat: Add landing page, demo access, and mobile responsiveness

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "%commit_msg%"

if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed.
    echo.
    pause
    exit /b 1
)

echo.
echo Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo   Push Failed!
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. Remote repository not set up
    echo 2. Authentication failed
    echo 3. Network issues
    echo.
    echo To set up remote repository:
    echo git remote add origin https://github.com/USERNAME/REPO.git
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Changes pushed to GitHub successfully!
echo.
echo Next steps:
echo 1. Verify changes on GitHub
echo 2. Deploy to Vercel (run deploy-vercel.bat)
echo 3. Test on mobile devices
echo.
pause
