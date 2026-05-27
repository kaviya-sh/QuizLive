import { useState, useEffect } from 'react'
import { quizApi } from '@/api/quiz'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'
import type { QuizTemplate } from '@/types/quiz'
import { CATEGORIES } from '@/types/quiz'
import { X, FileText } from 'lucide-react'

interface TemplatesLibraryProps {
  isOpen: boolean
  onClose: () => void
}

export const TemplatesLibrary = ({ isOpen, onClose }: TemplatesLibraryProps) => {
  const [templates, setTemplates] = useState<QuizTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const { setQuiz } = useQuizBuilderStore()

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, selectedCategory])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await quizApi.getTemplates(
        selectedCategory === 'all' ? undefined : selectedCategory
      )
      setTemplates(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadTemplate = async (templateId: string) => {
    try {
      const quiz = await quizApi.loadTemplate(templateId)
      setQuiz({ ...quiz, id: undefined, isDraft: true })
      onClose()
    } catch (error) {
      console.error('Failed to load template:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold text-gray-900">Quiz Templates</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b p-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border p-4">
                  <div className="mb-3 h-32 rounded bg-gray-200"></div>
                  <div className="mb-2 h-4 rounded bg-gray-200"></div>
                  <div className="h-3 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-gray-500">No templates found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-green-500 hover:shadow-md"
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  {template.coverImageUrl ? (
                    <img
                      src={template.coverImageUrl}
                      alt={template.title}
                      className="mb-3 h-32 w-full rounded object-cover"
                    />
                  ) : (
                    <div className="mb-3 flex h-32 items-center justify-center rounded bg-gray-100">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-green-600">
                    {template.title}
                  </h3>
                  <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="rounded-full bg-gray-100 px-2 py-1">{template.category}</span>
                    <span>{template.questionCount} questions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
