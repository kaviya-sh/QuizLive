import axios from '../lib/axios';

export interface CreateSessionRequest {
  quizId: number;
}

export interface SessionState {
  roomCode: string;
  status: 'WAITING' | 'ACTIVE' | 'QUESTION_OPEN' | 'QUESTION_CLOSED' | 'FINISHED';
  currentQuestionIndex: number;
  participantCount: number;
  currentQuestion?: {
    id: number;
    text: string;
    answers: Array<{ id: number; text: string }>;
    timeLimit: number;
    points: number;
  };
  answerDistribution?: Record<string, number>;
}

export interface Participant {
  participantId: string;
  displayName: string;
  totalScore: number;
}

export const sessionApi = {
  createSession: (data: CreateSessionRequest) =>
    axios.post<{ roomCode: string; status: string }>('/api/sessions', data),

  getSessionState: (roomCode: string) =>
    axios.get<SessionState>(`/api/sessions/${roomCode}`),

  startSession: (roomCode: string) =>
    axios.patch(`/api/sessions/${roomCode}/start`),

  nextQuestion: (roomCode: string) =>
    axios.patch(`/api/sessions/${roomCode}/next`),

  endSession: (roomCode: string) =>
    axios.patch(`/api/sessions/${roomCode}/end`),

  getQRCode: (roomCode: string) =>
    axios.get(`/api/sessions/${roomCode}/qr`, { responseType: 'blob' }),

  getParticipants: (roomCode: string) =>
    axios.get<Participant[]>(`/api/sessions/${roomCode}/participants`),

  removeParticipant: (roomCode: string, participantId: string) =>
    axios.delete(`/api/sessions/${roomCode}/participants/${participantId}`),
};
