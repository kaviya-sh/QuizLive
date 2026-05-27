import { useState } from 'react'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'
import { quizApi } from '@/api/quiz'
import type { Question, QuizOption, QuestionType } from '@/types/quiz'
import { Trash2, Plus, Upload, Sparkles } from 'lucide-react'

interface QuestionEditorProps {
  question: Question
}

export const QuestionEditor = ({ question }: QuestionEditorProps) => {
  const { updateQuestion, deleteQuestion } = useQuizBuilderStore()
  const [loadingAI, setLoadingAI] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleTypeChange = (type: QuestionType) => {
    let options: QuizOption[] = []

    if (type === 'multiple-choice') {
      options = [
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ]
    } else if (type === 'true-false') {
      options = [
        { id: crypto.randomUUID(), text: 'True', isCorrect: false },
        { id: crypto.randomUUID(), text: 'False', isCorrect: false },
      ]
    } else if (type === 'image-mcq') {
      options = [
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ]
    }

    updateQuestion(question.id, { type, options })
  }

  const addOption = () => {
    if (question.options.length >= 6) return
    const newOption: QuizOption = {
      id: crypto.randomUUID(),
      text: '',
      isCorrect: false,
    }
    updateQuestion(question.id, {
      options: [...question.options, newOption],
    })
  }

  const updateOption = (optionId: string, updates: Partial<QuizOption>) => {
    updateQuestion(question.id, {
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    })
  }

  const removeOption = (optionId: string) => {
    if (question.options.length <= 2) return
    updateQuestion(question.id, {
      options: question.options.filter((opt) => opt.id !== optionId),
    })
  }

  const setCorrectAnswer = (optionId: string) => {
    updateQuestion(question.id, {
      options: question.options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optionId,
      })),
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const url = await quizApi.uploadImage(file)
      updateQuestion(question.id, { imageUrl: url })
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  const suggestOptions = async () => {
    if (!question.text) return

    try {
      setLoadingAI(true)
      const suggestions = await quizApi.suggestOptions(question.text)
      const newOptions: QuizOption[] = suggestions.map((text, index) => ({
        id: crypto.randomUUID(),
        text,
        isCorrect: index === 0,
      }))
      updateQuestion(question.id, { options: newOptions })
    } catch (error) {
      console.error('AI suggestion failed:', error)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Question Editor</h3>
        <button
          onClick={() => deleteQuestion(question.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Question Type</label>
        <select
          value={question.type}
          onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="true-false">True/False</option>
          <option value="image-mcq">Image-based MCQ</option>
          <option value="open-ended">Open-ended</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Question Text *</label>
        <textarea
          value={question.text}
          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Enter your question"
        />
      </div>

      {question.type === 'image-mcq' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Image</label>
          {question.imageUrl ? (
            <div className="relative mt-2">
              <img
                src={question.imageUrl}
                alt="Question"
                className="h-48 w-full rounded-lg object-cover"
              />
              <button
                onClick={() => updateQuestion(question.id, { imageUrl: undefined })}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="mt-2 flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                {uploadingImage ? 'Uploading...' : 'Click to upload image'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          )}
        </div>
      )}

      {question.type !== 'open-ended' && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {question.type === 'multiple-choice' && (
              <div className="flex gap-2">
                <button
                  onClick={suggestOptions}
                  disabled={loadingAI || !question.text}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {loadingAI ? 'Generating...' : 'AI Suggest'}
                </button>
                {question.options.length < 6 && (
                  <button
                    onClick={addOption}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Option
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={option.isCorrect}
                  onChange={() => setCorrectAnswer(option.id)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, { text: e.target.value })}
                  disabled={question.type === 'true-false'}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-100"
                  placeholder={`Option ${index + 1}`}
                />
                {question.type === 'multiple-choice' && question.options.length > 2 && (
                  <button
                    onClick={() => removeOption(option.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Time Limit (seconds)
          </label>
          <input
            type="range"
            min="5"
            max="120"
            value={question.timeLimit}
            onChange={(e) =>
              updateQuestion(question.id, { timeLimit: parseInt(e.target.value) })
            }
            className="mt-2 w-full"
          />
          <div className="mt-1 text-center text-sm text-gray-600">{question.timeLimit}s</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Point Value</label>
          <input
            type="number"
            min="0"
            max="1000"
            value={question.points}
            onChange={(e) =>
              updateQuestion(question.id, { points: parseInt(e.target.value) || 0 })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id={`bonus-${question.id}`}
          checked={question.bonusForSpeed}
          onChange={(e) => updateQuestion(question.id, { bonusForSpeed: e.target.checked })}
          className="h-4 w-4 rounded text-green-600 focus:ring-green-500"
        />
        <label htmlFor={`bonus-${question.id}`} className="ml-2 text-sm text-gray-700">
          Bonus points for speed
        </label>
      </div>
    </div>
  )
}
