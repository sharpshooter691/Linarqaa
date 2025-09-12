import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

export interface User {
  id: string
  email: string
  fullName: string
  fullNameArabic?: string
  phone?: string
  role: 'OWNER' | 'STAFF'
  languagePreference: 'FR' | 'AR'
  active: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/auth/login', { email, password })
          const { token, user } = response.data
          
          // Store JWT token in localStorage
          localStorage.setItem('jwt-token', token)
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        // Clear JWT token
        localStorage.removeItem('jwt-token')
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true })
          const response = await api.get('/auth/me')
          const user = response.data
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          // Clear token if refresh fails
          localStorage.removeItem('jwt-token')
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
) 