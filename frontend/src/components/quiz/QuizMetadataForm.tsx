import { useState } from 'react'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'
import { quizApi } from '@/api/quiz'
import { CATEGORIES, LANGUAGES } from '@/types/quiz'
import { Upload, X } from 'lucide-react'

export const QuizMetadataForm = () => {
  const { quiz, updateQuizMetadata } = useQuizBuilderStore()
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const url = await quizApi.uploadImage(file)
      updateQuizMetadata({ coverImageUrl: url })
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeCoverImage = () => {
    updateQuizMetadata({ coverImageUrl: undefined })
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Quiz Details</h2>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={quiz.title}
          onChange={(e) => updateQuizMetadata({ title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Enter quiz title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={quiz.description}
          onChange={(e) => updateQuizMetadata({ description: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Brief description of your quiz"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={quiz.category}
            onChange={(e) => updateQuizMetadata({ category: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            id="language"
            value={quiz.language}
            onChange={(e) => updateQuizMetadata({ language: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        {quiz.coverImageUrl ? (
          <div className="relative mt-2">
            <img
              src={quiz.coverImageUrl}
              alt="Cover"
              className="h-48 w-full rounded-lg object-cover"
            />
            <button
              onClick={removeCoverImage}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="mt-2 flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Click to upload cover image'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  )
}
