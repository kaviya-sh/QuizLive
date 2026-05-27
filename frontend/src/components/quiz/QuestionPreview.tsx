import type { Question } from '@/types/quiz'
import { Clock, Award } from 'lucide-react'

interface QuestionPreviewProps {
  question: Question
}

export const QuestionPreview = ({ question }: QuestionPreviewProps) => {
  return (
    <div className="rounded-lg bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{question.timeLimit}s</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <Award className="h-4 w-4" />
            <span>{question.points} points</span>
            {question.bonusForSpeed && <span className="text-xs">(+ speed bonus)</span>}
          </div>
        </div>

        {question.imageUrl && (
          <div className="mb-6">
            <img
              src={question.imageUrl}
              alt="Question"
              className="h-64 w-full rounded-lg object-cover shadow-lg"
            />
          </div>
        )}

        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-2xl font-bold text-gray-900">
            {question.text || 'Question text will appear here'}
          </h3>
        </div>

        {question.type === 'open-ended' ? (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <textarea
              disabled
              placeholder="Participants will type their answer here..."
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-500"
              rows={4}
            />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {question.options.map((option, index) => (
              <button
                key={option.id}
                disabled
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  option.isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 font-medium text-gray-900">
                    {option.text || `Option ${index + 1}`}
                  </span>
                  {option.isCorrect && (
                    <span className="text-xs font-semibold text-green-600">✓ Correct</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          This is how participants will see this question
        </div>
      </div>
    </div>
  )
}
