import { create } from 'zustand';

interface SessionState {
  roomCode: string | null;
  participantId: string | null;
  displayName: string | null;
  currentQuestionIndex: number;
  score: number;
  streak: number;
  setSession: (roomCode: string, participantId: string, displayName: string) => void;
  updateScore: (score: number, streak: number) => void;
  setCurrentQuestionIndex: (index: number) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  roomCode: null,
  participantId: null,
  displayName: null,
  currentQuestionIndex: 0,
  score: 0,
  streak: 0,
  setSession: (roomCode, participantId, displayName) =>
    set({ roomCode, participantId, displayName }),
  updateScore: (score, streak) => set({ score, streak }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  clearSession: () =>
    set({
      roomCode: null,
      participantId: null,
      displayName: null,
      currentQuestionIndex: 0,
      score: 0,
      streak: 0,
    }),
}));
