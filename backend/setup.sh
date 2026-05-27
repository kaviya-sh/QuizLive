#!/bin/bash

# QuizLive Backend Setup Script

echo "🚀 QuizLive Backend Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file found"
else
    echo "⚠️  .env file not found"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your email credentials!"
    echo ""
    echo "For Gmail:"
    echo "1. Enable 2FA: https://myaccount.google.com/security"
    echo "2. Generate App Password: https://myaccount.google.com/apppasswords"
    echo "3. Update MAIL_USERNAME and MAIL_PASSWORD in .env"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

echo ""
echo "🔧 Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

echo "✅ Environment variables loaded"
echo ""
echo "📦 Building project..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting application..."
    echo ""
    java -jar target/quizlive-backend-1.0.0.jar
else
    echo ""
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
