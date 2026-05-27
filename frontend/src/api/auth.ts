import axiosInstance from '@/lib/axios'
import type { AuthResponse, LoginCredentials, RegisterData } from '@/types/auth'

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/register', data, {
      withCredentials: true,
    })
    return response.data
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', credentials, {
      withCredentials: true,
    })
    return response.data
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post(
      '/auth/refresh',
      {},
      {
        withCredentials: true,
      }
    )
    return response.data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout', {}, { withCredentials: true })
  },
}
