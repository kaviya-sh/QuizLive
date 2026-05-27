export type QuestionType = 'multiple-choice' | 'true-false' | 'image-mcq' | 'open-ended'

export interface QuizOption {
  id: string
  text: string
  imageUrl?: string
  isCorrect: boolean
}

export interface Question {
  id: string
  type: QuestionType
  text: string
  imageUrl?: string
  options: QuizOption[]
  timeLimit: number // seconds
  points: number
  bonusForSpeed: boolean
  order: number
}

export interface Quiz {
  id?: string
  title: string
  description: string
  category: string
  coverImageUrl?: string
  language: string
  questions: Question[]
  isDraft: boolean
  createdAt?: string
  updatedAt?: string
}

export interface QuizTemplate {
  id: string
  title: string
  description: string
  category: string
  coverImageUrl?: string
  questionCount: number
}

export interface AIQuestionSuggestion {
  text: string
  type: QuestionType
  options: Array<{ text: string; isCorrect: boolean }>
}

export const CATEGORIES = [
  'Business',
  'Trivia',
  'Education',
  'Pop Culture',
  'Science',
  'Technology',
  'Sports',
  'Entertainment',
  'Other',
] as const

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
] as const
