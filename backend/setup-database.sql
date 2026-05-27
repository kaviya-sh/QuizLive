-- Run this in PostgreSQL (psql or pgAdmin)

-- Create user
CREATE USER quizlive WITH PASSWORD 'quizlive';

-- Create database
CREATE DATABASE quizlive OWNER quizlive;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE quizlive TO quizlive;
