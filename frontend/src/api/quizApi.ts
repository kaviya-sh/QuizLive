import client from './client';
import { Quiz } from '../types/api';

export interface CreateQuizRequest {
  title: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  language?: string;
  questions?: QuestionRequest[];
}

export interface QuestionRequest {
  id?: string;
  type: string;
  text: string;
  imageUrl?: string;
  timeLimitSeconds?: number;
  points?: number;
  speedBonusEnabled?: boolean;
  orderIndex: number;
  options?: OptionRequest[];
}

export interface OptionRequest {
  id?: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export const quizApi = {
  getQuizzes: (page = 0, size = 10) =>
    client.get<{ content: Quiz[]; totalElements: number }>(`/quizzes?page=${page}&size=${size}`),

  createQuiz: (data: CreateQuizRequest) =>
    client.post<Quiz>('/quizzes', data),

  getQuiz: (id: string) =>
    client.get<Quiz>(`/quizzes/${id}`),

  updateQuiz: (id: string, data: CreateQuizRequest) =>
    client.put<Quiz>(`/quizzes/${id}`, data),

  deleteQuiz: (id: string) =>
    client.delete(`/quizzes/${id}`),

  publishQuiz: (id: string) =>
    client.patch<Quiz>(`/quizzes/${id}/publish`),
};
