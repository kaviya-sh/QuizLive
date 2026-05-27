import { useEffect, useRef } from 'react'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'
import { quizApi } from '@/api/quiz'

export const useAutosave = (enabled: boolean = true) => {
  const { quiz, setSaving, setLastSaved } = useQuizBuilderStore()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastQuizRef = useRef<string>()

  useEffect(() => {
    if (!enabled || !quiz.id) return

    const currentQuizString = JSON.stringify(quiz)
    
    if (currentQuizString === lastQuizRef.current) return

    lastQuizRef.current = currentQuizString

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true)
        await quizApi.updateQuiz(quiz.id!, quiz)
        setLastSaved(new Date())
      } catch (error) {
        console.error('Autosave failed:', error)
      } finally {
        setSaving(false)
      }
    }, 30000) // 30 seconds

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [quiz, enabled, setSaving, setLastSaved])
}
