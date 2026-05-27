import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'
import { useAutosave } from '@/hooks/useAutosave'
import { quizApi } from '@/api/quiz'
import { QuizMetadataForm } from '@/components/quiz/QuizMetadataForm'
import { QuestionList } from '@/components/quiz/QuestionList'
import { QuestionEditor } from '@/components/quiz/QuestionEditor'
import { QuestionPreview } from '@/components/quiz/QuestionPreview'
import { TemplatesLibrary } from '@/components/quiz/TemplatesLibrary'
import { AIQuestionGenerator } from '@/components/quiz/AIQuestionGenerator'
import {
  Save,
  Eye,
  Undo,
  Redo,
  FileText,
  Sparkles,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

export default function QuizBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    quiz,
    selectedQuestionId,
    isSaving,
    lastSaved,
    canUndo,
    canRedo,
    undo,
    redo,
    setQuiz,
    reset,
  } = useQuizBuilderStore()

  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [saving, setSaving] = useState(false)

  useAutosave(!!quiz.id)

  useEffect(() => {
    if (id && id !== 'new') {
      loadQuiz(id)
    } else {
      reset()
    }
  }, [id])

  const loadQuiz = async (quizId: string) => {
    try {
      const data = await quizApi.getQuiz(quizId)
      setQuiz(data)
    } catch (error) {
      console.error('Failed to load quiz:', error)
      navigate('/quiz/new')
    }
  }

  const handleSave = async (isDraft: boolean) => {
    if (!quiz.title.trim()) {
      alert('Please enter a quiz title')
      return
    }

    try {
      setSaving(true)
      const quizData = { ...quiz, isDraft }

      if (quiz.id) {
        await quizApi.updateQuiz(quiz.id, quizData)
        if (quiz.questions.length > 0) {
          await quizApi.bulkUpsertQuestions(quiz.id, quiz.questions)
        }
      } else {
        const created = await quizApi.createQuiz(quizData)
        if (quiz.questions.length > 0) {
          await quizApi.bulkUpsertQuestions(created.id!, quiz.questions)
        }
        navigate(`/quiz/${created.id}/edit`, { replace: true })
      }

      alert(isDraft ? 'Quiz saved as draft' : 'Quiz published successfully!')
    } catch (error) {
      console.error('Failed to save quiz:', error)
      alert('Failed to save quiz. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectedQuestion = quiz.questions.find((q) => q.id === selectedQuestionId)

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {quiz.title || 'Untitled Quiz'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                </>
              ) : (
                <span>Not saved</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="rounded p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-5 w-5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="rounded p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-5 w-5" />
          </button>

          <div className="mx-2 h-6 w-px bg-gray-300"></div>

          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Templates
          </button>

          <button
            onClick={() => setShowAIGenerator(true)}
            className="flex items-center gap-2 rounded-md border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
              showPreview
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Edit' : 'Preview'}
          </button>

          <div className="mx-2 h-6 w-px bg-gray-300"></div>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Publish
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Question List */}
        <aside className="w-80 border-r bg-white p-6 overflow-y-auto">
          <QuestionList />
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {!selectedQuestionId ? (
              <QuizMetadataForm />
            ) : showPreview && selectedQuestion ? (
              <QuestionPreview question={selectedQuestion} />
            ) : selectedQuestion ? (
              <QuestionEditor question={selectedQuestion} />
            ) : (
              <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">Select a question to edit</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <TemplatesLibrary isOpen={showTemplates} onClose={() => setShowTemplates(false)} />
      <AIQuestionGenerator isOpen={showAIGenerator} onClose={() => setShowAIGenerator(false)} />
    </div>
  )
}
