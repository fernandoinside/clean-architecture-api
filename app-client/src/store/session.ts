'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { Session, CreateSessionData, UpdateSessionData, SessionFilters, SessionStore } from '@/types'

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      selectedSession: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchSessions: async (filters?: SessionFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get('/sessions', { params })
          const { data, pagination } = response.data
          set({ 
            sessions: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar sessões:', error)
          set({ loading: false })
        }
      },

      createSession: async (data: CreateSessionData) => {
        set({ loading: true })
        try {
          const response = await api.post('/sessions', data)
          const newSession = response.data.data
          set(state => ({ 
            sessions: [newSession, ...state.sessions], 
            loading: false 
          }))
          return newSession
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateSession: async (id: number, data: UpdateSessionData) => {
        set({ loading: true })
        try {
          const response = await api.put(`/sessions/${id}`, data)
          const updatedSession = response.data.data
          set(state => ({
            sessions: state.sessions.map(item => 
              item.id === id ? updatedSession : item
            ),
            selectedSession: state.selectedSession?.id === id 
              ? updatedSession 
              : state.selectedSession,
            loading: false
          }))
          return updatedSession
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deleteSession: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete(`/sessions/${id}`)
          set(state => ({
            sessions: state.sessions.filter(item => item.id !== id),
            selectedSession: state.selectedSession?.id === id 
              ? null 
              : state.selectedSession,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedSession: (session: Session | null) => {
        set({ selectedSession: session })
      },

      setFilters: (filters: Partial<SessionFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'session-store'
    }
  )
)