import axiosInstance from '@/lib/axios'
import type { Quiz, Question, QuizTemplate, AIQuestionSuggestion } from '@/types/quiz'

export const quizApi = {
  // Quiz CRUD
  createQuiz: async (quiz: Partial<Quiz>): Promise<Quiz> => {
    const response = await axiosInstance.post('/quizzes', quiz)
    return response.data
  },

  updateQuiz: async (id: string, quiz: Partial<Quiz>): Promise<Quiz> => {
    const response = await axiosInstance.put(`/quizzes/${id}`, quiz)
    return response.data
  },

  getQuiz: async (id: string): Promise<Quiz> => {
    const response = await axiosInstance.get(`/quizzes/${id}`)
    return response.data
  },

  deleteQuiz: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/quizzes/${id}`)
  },

  // Questions bulk operations
  bulkUpsertQuestions: async (quizId: string, questions: Question[]): Promise<Question[]> => {
    const response = await axiosInstance.post(`/quizzes/${quizId}/questions`, questions)
    return response.data
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await axiosInstance.delete(`/questions/${questionId}`)
  },

  // Templates
  getTemplates: async (category?: string): Promise<QuizTemplate[]> => {
    const params = category ? { category } : {}
    const response = await axiosInstance.get('/templates', { params })
    return response.data
  },

  loadTemplate: async (templateId: string): Promise<Quiz> => {
    const response = await axiosInstance.get(`/templates/${templateId}`)
    return response.data
  },

  // AI Features
  suggestQuestions: async (topic: string): Promise<AIQuestionSuggestion[]> => {
    const response = await axiosInstance.post('/ai/suggest-questions', { topic })
    return response.data
  },

  suggestOptions: async (questionText: string): Promise<string[]> => {
    const response = await axiosInstance.post('/ai/suggest-options', { questionText })
    return response.data
  },

  // Image upload
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axiosInstance.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.url
  },
}
