@echo off
echo ========================================
echo  Deploying OTP Email Fix
echo ========================================
echo.
echo Changes:
echo - Added detailed logging for OTP sending
echo - Improved error messages
echo - OTP logged in server logs when email fails
echo - Better frontend error handling
echo.

cd /d "c:\Users\LENOVO\OneDrive\Desktop\Kavi Projects\Quiz System\QuizLive"

git add .
git commit -m "Fix: Add detailed OTP logging and error handling for forgot password"
git push origin main

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Wait for Render deployment (~5 min)
echo 2. Check Render logs at: https://dashboard.render.com
echo 3. Test forgot password at: https://sparklo-in.vercel.app/forgot-password
echo 4. If email fails, OTP will be in Render logs
echo.
echo To check logs:
echo - Go to Render dashboard
echo - Click on your service
echo - View Logs tab
echo - Search for "OTP for" to find the OTP
echo.
pause
