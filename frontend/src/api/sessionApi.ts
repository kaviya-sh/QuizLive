import client from './client';
import { Session } from '../types/api';

export interface CreateSessionRequest {
  quizId: string;
}

export interface JoinSessionRequest {
  displayName: string;
  avatarEmoji?: string;
}

export const sessionApi = {
  createSession: (data: CreateSessionRequest) =>
    client.post<Session>('/sessions', data),

  getSession: (roomCode: string) =>
    client.get<Session>(`/sessions/${roomCode}`),

  startSession: (roomCode: string) =>
    client.patch<Session>(`/sessions/${roomCode}/start`),

  nextQuestion: (roomCode: string) =>
    client.patch<Session>(`/sessions/${roomCode}/next`),

  endSession: (roomCode: string) =>
    client.patch(`/sessions/${roomCode}/end`),

  getQRCode: (roomCode: string) =>
    client.get(`/sessions/${roomCode}/qr`, { responseType: 'blob' }),

  joinSession: (roomCode: string, data: JoinSessionRequest) =>
    client.post<{ participantId: string; guestToken: string; quizTitle: string; status: string; spectator: boolean; sessionId: string }>(
      `/sessions/${roomCode}/join`,
      data
    ),

  getLeaderboard: (roomCode: string) =>
    client.get<{ id: string; displayName: string; avatarEmoji?: string; score: number; rank: number; joinedLate?: boolean }[]>(
      `/sessions/${roomCode}/leaderboard`
    ),

  getParticipantHistory: (participantId: string) =>
    client.get<any[]>(`/sessions/participant/history?participantId=${participantId}`),

  getMyHistory: () =>
    client.get<any[]>('/sessions/my-history'),

  getActiveSessions: () =>
    client.get<Session[]>('/sessions/active'),

  getSessionHistory: () =>
    client.get<Session[]>('/sessions/history'),

  getParticipantResults: (roomCode: string, participantId: string) =>
    client.get<{ rank: number; score: number; totalScore: number; accuracy: number; correctAnswers: number; totalQuestions: number }>(
      `/sessions/${roomCode}/results?participantId=${participantId}`
    ),
};
