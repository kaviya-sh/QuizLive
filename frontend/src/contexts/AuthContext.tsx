import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '@/api/auth'
import { setAccessToken, getAccessToken } from '@/lib/axios'
import type { User, LoginCredentials, RegisterData } from '@/types/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isHost: boolean
  isParticipant: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken()
      if (token) {
        try {
          await authApi.refresh()
          const storedUser = sessionStorage.getItem('user')
          if (storedUser) {
            setUser(JSON.parse(storedUser))
          }
        } catch (error) {
          setAccessToken(null)
          sessionStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    setAccessToken(response.accessToken)
    setUser(response.user)
    sessionStorage.setItem('user', JSON.stringify(response.user))
  }

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data)
    setAccessToken(response.accessToken)
    setUser(response.user)
    sessionStorage.setItem('user', JSON.stringify(response.user))
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAccessToken(null)
      setUser(null)
      sessionStorage.removeItem('user')
    }
  }

  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isHost: user?.role === 'HOST',
    isParticipant: user?.role === 'PARTICIPANT',
    login,
    register,
    logout,
    loginWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
