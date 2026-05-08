// Auth API service — wired up in Phase 2
import type { LoginCredentials, RegisterData, AuthResult, TokenPair } from '@/types/auth'

export const authService = {
  login: async (_credentials: LoginCredentials): Promise<AuthResult> => {
    // TODO: POST /auth/login
    throw new Error('Not implemented')
  },

  register: async (_data: RegisterData): Promise<AuthResult> => {
    // TODO: POST /auth/register
    throw new Error('Not implemented')
  },

  logout: async (): Promise<void> => {
    // TODO: POST /auth/logout
  },

  refreshToken: async (_refreshToken: string): Promise<TokenPair> => {
    // TODO: POST /auth/refresh
    throw new Error('Not implemented')
  },

  forgotPassword: async (_email: string): Promise<void> => {
    // TODO: POST /auth/forgot-password
  },

  resetPassword: async (_token: string, _newPassword: string): Promise<void> => {
    // TODO: POST /auth/reset-password
  },

  verifyEmail: async (_token: string): Promise<void> => {
    // TODO: POST /auth/verify-email
  },
}
