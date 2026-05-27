export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  language?: string;
  status: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: string;
  text: string;
  imageUrl?: string;
  timeLimitSeconds: number;
  points: number;
  speedBonusEnabled: boolean;
  orderIndex: number;
  options: Option[];
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface Session {
  id: string;
  roomCode: string;
  status: string;
  currentQuestionIndex: number;
  participantCount: number;
  quiz: Quiz;
  currentQuestion?: Question;
  participants?: Participant[];
  answerDistribution?: Record<string, number>;
  startTime?: number;
  endTime?: number;
  durationSeconds?: number;
}

export interface Participant {
  id: string;
  displayName: string;
  avatarEmoji?: string;
  score: number;
  streak: number;
  rank?: number;
  joinedLate?: boolean;
}
