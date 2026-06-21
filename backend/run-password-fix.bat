@echo off
echo ==========================================
echo Password Fix Script
echo ==========================================
echo.
echo This script will connect to production DB and fix passwords
echo.
echo Database: quizlive_prod
echo Users: demo@sparklo.in, demohost@sparklo.in
echo Password: demo123
echo.
pause

cd /d "%~dp0"

psql "postgresql://neondb_owner:npg_Wd59yJgvZpXT@ep-noisy-brook-aplc69tm.c-7.us-east-1.aws.neon.tech/quizlive_prod?sslmode=require" -f fix-passwords-correct.sql

echo.
echo ==========================================
echo Fix completed! Check output above
echo ==========================================
pause
