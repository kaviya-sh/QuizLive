import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'
import type { Question } from '@/types/quiz'
import { GripVertical, Plus } from 'lucide-react'

const SortableQuestionItem = ({ question, isSelected }: { question: Question; isSelected: boolean }) => {
  const { selectQuestion } = useQuizBuilderStore()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return 'MCQ'
      case 'true-false':
        return 'T/F'
      case 'image-mcq':
        return 'Image MCQ'
      case 'open-ended':
        return 'Open'
      default:
        return type
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
        isSelected
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => selectQuestion(question.id)}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            {getQuestionTypeLabel(question.type)}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{question.points} pts</span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-gray-900">
          {question.text || 'Untitled Question'}
        </p>
      </div>
    </div>
  )
}

export const QuestionList = () => {
  const { quiz, selectedQuestionId, reorderQuestions, addQuestion } = useQuizBuilderStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = quiz.questions.findIndex((q) => q.id === active.id)
      const newIndex = quiz.questions.findIndex((q) => q.id === over.id)
      const reordered = arrayMove(quiz.questions, oldIndex, newIndex)
      reorderQuestions(reordered)
    }
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'multiple-choice',
      text: '',
      options: [
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ],
      timeLimit: 30,
      points: 10,
      bonusForSpeed: false,
      order: quiz.questions.length,
    }
    addQuestion(newQuestion)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
        <span className="text-sm text-gray-500">{quiz.questions.length} total</span>
      </div>

      <button
        onClick={handleAddQuestion}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-600 hover:border-green-500 hover:text-green-600"
      >
        <Plus className="h-4 w-4" />
        Add Question
      </button>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {quiz.questions.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">No questions yet</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={quiz.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              {quiz.questions.map((question) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  isSelected={question.id === selectedQuestionId}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
