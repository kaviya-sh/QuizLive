import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Quiz, Question } from '@/types/quiz'

interface QuizBuilderState {
  quiz: Quiz
  selectedQuestionId: string | null
  isSaving: boolean
  lastSaved: Date | null
  history: Quiz[]
  historyIndex: number
  
  // Actions
  setQuiz: (quiz: Quiz) => void
  updateQuizMetadata: (metadata: Partial<Quiz>) => void
  addQuestion: (question: Question) => void
  updateQuestion: (questionId: string, updates: Partial<Question>) => void
  deleteQuestion: (questionId: string) => void
  reorderQuestions: (questions: Question[]) => void
  selectQuestion: (questionId: string | null) => void
  setSaving: (isSaving: boolean) => void
  setLastSaved: (date: Date) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  reset: () => void
}

const MAX_HISTORY = 20

const initialQuiz: Quiz = {
  title: '',
  description: '',
  category: 'Other',
  language: 'en',
  questions: [],
  isDraft: true,
}

const addToHistory = (state: QuizBuilderState, newQuiz: Quiz) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(JSON.parse(JSON.stringify(newQuiz)))
  
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift()
  }
  
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  }
}

export const useQuizBuilderStore = create<QuizBuilderState>()(
  devtools(
    (set, get) => ({
      quiz: initialQuiz,
      selectedQuestionId: null,
      isSaving: false,
      lastSaved: null,
      history: [JSON.parse(JSON.stringify(initialQuiz))],
      historyIndex: 0,

      setQuiz: (quiz) =>
        set((state) => ({
          quiz,
          ...addToHistory(state, quiz),
        })),

      updateQuizMetadata: (metadata) =>
        set((state) => {
          const newQuiz = { ...state.quiz, ...metadata }
          return {
            quiz: newQuiz,
            ...addToHistory(state, newQuiz),
          }
        }),

      addQuestion: (question) =>
        set((state) => {
          const newQuiz = {
            ...state.quiz,
            questions: [...state.quiz.questions, question],
          }
          return {
            quiz: newQuiz,
            selectedQuestionId: question.id,
            ...addToHistory(state, newQuiz),
          }
        }),

      updateQuestion: (questionId, updates) =>
        set((state) => {
          const newQuiz = {
            ...state.quiz,
            questions: state.quiz.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates } : q
            ),
          }
          return {
            quiz: newQuiz,
            ...addToHistory(state, newQuiz),
          }
        }),

      deleteQuestion: (questionId) =>
        set((state) => {
          const newQuiz = {
            ...state.quiz,
            questions: state.quiz.questions.filter((q) => q.id !== questionId),
          }
          return {
            quiz: newQuiz,
            selectedQuestionId:
              state.selectedQuestionId === questionId ? null : state.selectedQuestionId,
            ...addToHistory(state, newQuiz),
          }
        }),

      reorderQuestions: (questions) =>
        set((state) => {
          const newQuiz = {
            ...state.quiz,
            questions: questions.map((q, index) => ({ ...q, order: index })),
          }
          return {
            quiz: newQuiz,
            ...addToHistory(state, newQuiz),
          }
        }),

      selectQuestion: (questionId) =>
        set({ selectedQuestionId: questionId }),

      setSaving: (isSaving) => set({ isSaving }),

      setLastSaved: (date) => set({ lastSaved: date }),

      undo: () =>
        set((state) => {
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1
            return {
              quiz: JSON.parse(JSON.stringify(state.history[newIndex])),
              historyIndex: newIndex,
            }
          }
          return state
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1
            return {
              quiz: JSON.parse(JSON.stringify(state.history[newIndex])),
              historyIndex: newIndex,
            }
          }
          return state
        }),

      canUndo: () => get().historyIndex > 0,

      canRedo: () => get().historyIndex < get().history.length - 1,

      reset: () =>
        set({
          quiz: initialQuiz,
          selectedQuestionId: null,
          isSaving: false,
          lastSaved: null,
          history: [JSON.parse(JSON.stringify(initialQuiz))],
          historyIndex: 0,
        }),
    }),
    { name: 'quiz-builder' }
  )
)
