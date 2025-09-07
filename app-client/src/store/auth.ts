import { create } from 'zustand'
import { persist, PersistStorage } from 'zustand/middleware'
import { LoginCredentials, User } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string) => void
}

// Custom storage that handles SSR and token synchronization
const createStorage = (): PersistStorage<Pick<AuthState, 'user' | 'token' | 'isAuthenticated'>> => ({
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    
    // First try to get from localStorage
    const value = localStorage.getItem(name)
    if (!value) return null
    
    try {
      const state = JSON.parse(value)
      
      // Always sync with the auth_token in localStorage
      const token = localStorage.getItem('auth_token')
      if (token && state.token !== token) {
        state.token = token
        state.isAuthenticated = true
      }
      
      return state
    } catch (e) {
      return null
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    
    // Always keep auth_token in sync with the token in state
    if (value && 'token' in value && value.token) {
      localStorage.setItem('auth_token', value.token)
    }
    
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem(name)
  },
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Inicia como loading
      
      login: async (credentials) => {
        try {
          set({ isLoading: true })
          const response = await api.auth.login(credentials)
          const { user, token } = response.data.data
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token)
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          toast.success('Login realizado com sucesso!')
        } catch (error: unknown) {
          set({ isLoading: false })
          const message = error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao fazer login'
            : 'Erro ao fazer login'
          toast.error(message as string)
          throw error
        }
      },
      
      logout: () => {
        try {
          api.auth.logout().catch(() => {})
        } catch (error: unknown) { /* ignore */ }
        finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
          toast.success('Logout realizado com sucesso!')
        }
      },
      
      setUser: (user) => set({ user }),
      
      setToken: (token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }
        set({ token, isAuthenticated: true })
      },
    }),
    {
      name: 'auth-storage',
      storage: createStorage(),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        
        // Ensure loading is false after rehydration
        if (state) {
          // Validate token if it exists
          if (typeof window !== 'undefined' && state.token) {
            const storedToken = localStorage.getItem('auth_token')
            if (storedToken && state.token === storedToken) {
              state.isAuthenticated = true
            } else {
              // Token mismatch or missing, clear state
              state.user = null
              state.token = null
              state.isAuthenticated = false
            }
          } else {
            // No token, ensure user is not authenticated
            state.isAuthenticated = false
          }
          
          // Always set loading to false after rehydration
          state.isLoading = false
        }
      },
      skipHydration: false,
      version: 1, // Increment this if you make breaking changes to the store structure
      migrate: (persistedState: unknown, version: number) => {
        // If no version, it's the initial version
        if (version === 0) return persistedState as AuthState
        
        // Future migration logic can be added here when version > 1
        return persistedState as AuthState
      }
    },
  )
)
