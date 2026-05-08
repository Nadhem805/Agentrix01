import { create } from 'zustand'
import type { User, LoginCredentials } from '@/types/auth'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (_credentials: LoginCredentials) => {
    set({ isLoading: true })
    try {
      // TODO: wire up httpClient in Phase 2
      throw new Error('Not implemented')
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    // TODO: call API logout endpoint in Phase 2
    set({ user: null, isAuthenticated: false })
  },

  refreshUser: async () => {
    // TODO: GET /auth/me in Phase 2
  },

  setUser: (user) => set({ user, isAuthenticated: user !== null }),
}))
