import client from './client';

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  register: (data: RegisterRequest) =>
    client.post<AuthResponse>('/api/auth/register', data),

  login: (data: LoginRequest) =>
    client.post<AuthResponse>('/api/auth/login', data),

  logout: () =>
    client.post('/api/auth/logout'),

  refresh: () =>
    client.post<{ accessToken: string }>('/api/auth/refresh'),

  forgotPassword: (email: string) =>
    client.post<{ message: string }>('/api/auth/forgot-password', null, {
      params: { email }
    }),

  verifyOtp: (email: string, otp: string) =>
    client.post<{ message: string }>('/api/auth/verify-otp', null, {
      params: { email, otp }
    }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    client.post<{ message: string }>('/api/auth/reset-password', null, {
      params: { email, otp, newPassword }
    }),
};
