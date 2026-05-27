import client from './client';

export interface AnalyticsSummary {
  sessionId: string;
  totalParticipants: number;
  averageScore: number;
  completionRate: number;
  durationSeconds: number;
  hardestQuestion: {
    id: string;
    text: string;
    accuracy: number;
  };
  fastestQuestion: {
    id: string;
    text: string;
    avgResponseTimeMs: number;
  };
}

export interface WordFrequency {
  word: string;
  frequency: number;
}

export const analyticsApi = {
  getSummary: (sessionId: string) =>
    client.get<AnalyticsSummary>(`/analytics/${sessionId}/summary`),

  downloadCSV: (sessionId: string) =>
    client.get(`/analytics/${sessionId}/csv`, { responseType: 'blob' }),

  downloadPDF: (sessionId: string) =>
    client.get(`/analytics/${sessionId}/pdf`, { responseType: 'blob' }),

  getWordCloud: (sessionId: string) =>
    client.get<WordFrequency[]>(`/analytics/${sessionId}/wordcloud`),
};
