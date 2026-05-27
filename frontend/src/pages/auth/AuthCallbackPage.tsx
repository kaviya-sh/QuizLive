import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setAccessToken } from '@/lib/axios'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      setAccessToken(token)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
    </div>
  )
}
