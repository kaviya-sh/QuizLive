export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  role: 'HOST' | 'PARTICIPANT'
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  displayName: string
  role: 'HOST' | 'PARTICIPANT'
}
