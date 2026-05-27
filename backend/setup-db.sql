-- Run this in your PostgreSQL (psql or pgAdmin)
CREATE DATABASE quizlive;
CREATE USER quizlive WITH PASSWORD 'quizlive';
GRANT ALL PRIVILEGES ON DATABASE quizlive TO quizlive;
\c quizlive
GRANT ALL ON SCHEMA public TO quizlive;
