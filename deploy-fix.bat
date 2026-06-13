@echo off
echo ========================================
echo  Deploying Password Fix to GitHub
echo ========================================
echo.

cd /d "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive"

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Adding all changes...
git add .
echo.

echo [3/4] Committing changes...
git commit -m "Fix: Disable mail health check to prevent deployment timeout and force update demo passwords"
echo.

echo [4/4] Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Render will auto-deploy in ~5 minutes
echo 2. Check logs at: https://dashboard.render.com
echo 3. Test login at: https://sparklo-in.vercel.app/login
echo    - Email: demo@sparklo.in
echo    - Password: demo123
echo.
pause
