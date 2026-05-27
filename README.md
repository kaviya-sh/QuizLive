# QuizLive - Live Quiz Platform

A Slido-inspired real-time quiz platform built with React, Spring Boot, WebSocket, and Redis.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Java 21
- Docker & Docker Compose
- Maven 3.9+

### 1. Start Infrastructure

```bash
docker-compose up -d
```

Services:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO: `localhost:9000` (Console: `localhost:9001`)
- Mailhog: `localhost:8025`

### 2. Start Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:8081`

Verify: 
- Health: http://localhost:8081/actuator/health
- Swagger: http://localhost:8081/swagger-ui.html

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

### 4. Test Full Flow

1. Register as HOST at http://localhost:3000/register
2. Login and access dashboard
3. Create a quiz (coming soon)
4. Start a session and get room code
5. Open new tab, join as participant
6. Play quiz end-to-end

## 📦 Tech Stack

### Frontend
- React 18 + Vite + TypeScript
- TailwindCSS (Slido green: #198038)
- Zustand (state management)
- React Router v6
- Axios + React Query
- @stomp/stompjs (WebSocket)
- Recharts (charts)
- Framer Motion (animations)

### Backend
- Spring Boot 3.2 + Java 21
- Spring Security + JWT
- Spring Data JPA + PostgreSQL
- Spring WebSocket + STOMP
- Spring Data Redis
- Flyway (migrations)
- MinIO (file storage)
- ZXing (QR codes)

## 🔧 Configuration

### Environment Variables

Backend (`backend/src/main/resources/application.yml`):
- Server port: 8081
- Database: PostgreSQL on localhost:5432
- Redis: localhost:6379
- JWT secret: configured in application.yml

Frontend (`frontend/.env.development`):
- VITE_API_BASE_URL=http://localhost:8081/api
- VITE_WS_URL=http://localhost:8081

## 📚 API Endpoints

### Authentication (Public)
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout

### Quizzes (ROLE_HOST)
- GET `/api/quizzes` - List quizzes
- POST `/api/quizzes` - Create quiz
- GET `/api/quizzes/{id}` - Get quiz details
- PUT `/api/quizzes/{id}` - Update quiz
- DELETE `/api/quizzes/{id}` - Delete quiz

### Sessions (ROLE_HOST)
- POST `/api/sessions` - Create session
- GET `/api/sessions/{roomCode}` - Get session state
- PATCH `/api/sessions/{roomCode}/start` - Start session
- PATCH `/api/sessions/{roomCode}/next` - Next question
- PATCH `/api/sessions/{roomCode}/end` - End session
- GET `/api/sessions/{roomCode}/qr` - Get QR code

### Participants (Public)
- POST `/api/sessions/{roomCode}/join` - Join session
- GET `/api/sessions/{roomCode}/results` - Get results

## 🎯 Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Host/Participant)
- ✅ Real-time quiz sessions via WebSocket
- ✅ Live leaderboards with Redis
- ✅ Time-based scoring with streak bonuses
- ✅ QR code generation for easy joining
- ✅ Dark presenter view for hosts
- ✅ Animated participant experience
- ✅ Comprehensive analytics

## 🧪 Testing

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm run test
```

## 🐳 Docker

Build and run with Docker:

```bash
docker-compose up -d
```

## 📄 License

MIT License

## 👥 Team

Built with ❤️ by the QuizLive team
