@echo off
echo Connecting to Production Database...
echo.

REM Set connection string
set "CONNECTION_STRING=postgresql://neondb_owner:npg_Wd59yJgvZpXT@ep-noisy-brook-aplc69tm.c-7.us-east-1.aws.neon.tech/quizlive_prod?sslmode=require"

echo Connection String:
echo %CONNECTION_STRING%
echo.

REM Try to connect
psql "%CONNECTION_STRING%"

pause
