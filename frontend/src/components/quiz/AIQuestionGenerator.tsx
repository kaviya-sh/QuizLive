import { useState } from 'react'
import { quizApi } from '@/api/quiz'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'
import type { AIQuestionSuggestion, Question } from '@/types/quiz'
import { X, Sparkles, Check } from 'lucide-react'

interface AIQuestionGeneratorProps {
  isOpen: boolean
  onClose: () => void
}

export const AIQuestionGenerator = ({ isOpen, onClose }: AIQuestionGeneratorProps) => {
  const [topic, setTopic] = useState('')
  const [suggestions, setSuggestions] = useState<AIQuestionSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set())
  const { addQuestion, quiz } = useQuizBuilderStore()

  const generateQuestions = async () => {
    if (!topic.trim()) return

    try {
      setLoading(true)
      const data = await quizApi.suggestQuestions(topic)
      setSuggestions(data)
      setSelectedSuggestions(new Set(data.map((_, i) => i)))
    } catch (error) {
      console.error('Failed to generate questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedSuggestions(newSelected)
  }

  const updateSuggestion = (index: number, updates: Partial<AIQuestionSuggestion>) => {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    )
  }

  const acceptSelected = () => {
    suggestions.forEach((suggestion, index) => {
      if (selectedSuggestions.has(index)) {
        const newQuestion: Question = {
          id: crypto.randomUUID(),
          type: suggestion.type,
          text: suggestion.text,
          options: suggestion.options.map((opt) => ({
            id: crypto.randomUUID(),
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
          timeLimit: 30,
          points: 10,
          bonusForSpeed: false,
          order: quiz.questions.length,
        }
        addQuestion(newQuestion)
      }
    })
    onClose()
    setTopic('')
    setSuggestions([])
    setSelectedSuggestions(new Set())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI Question Generator</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              What topic should the questions be about?
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateQuestions()}
                placeholder="e.g., World History, JavaScript Basics, Marketing Strategies"
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={generateQuestions}
                disabled={loading || !topic.trim()}
                className="flex items-center gap-2 rounded-md bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg border p-4">
                    <div className="mb-3 h-4 rounded bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-3 rounded bg-gray-200"></div>
                      <div className="h-3 rounded bg-gray-200"></div>
                      <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">Enter a topic to generate questions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 transition-all ${
                      selectedSuggestions.has(index)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.has(index)}
                        onChange={() => toggleSelection(index)}
                        className="mt-1 h-5 w-5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                            {suggestion.type.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <textarea
                          value={suggestion.text}
                          onChange={(e) => updateSuggestion(index, { text: e.target.value })}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          rows={2}
                        />
                      </div>
                    </div>

                    {suggestion.options.length > 0 && (
                      <div className="ml-8 space-y-1">
                        {suggestion.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 text-sm">
                            <span
                              className={`font-medium ${
                                option.isCorrect ? 'text-green-600' : 'text-gray-600'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className={option.isCorrect ? 'font-medium' : ''}>
                              {option.text}
                            </span>
                            {option.isCorrect && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="flex items-center justify-between border-t p-6">
            <p className="text-sm text-gray-600">
              {selectedSuggestions.size} of {suggestions.length} questions selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={acceptSelected}
                disabled={selectedSuggestions.size === 0}
                className="rounded-md bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add {selectedSuggestions.size} Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
