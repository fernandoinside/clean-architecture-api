'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { User, CreateUserData, UpdateUserData, UserFilters, UserStore } from '@/types'

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      selectedUser: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchUsers: async (filters?: UserFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get('/users', { params })
          const { data, pagination } = response.data
          set({ 
            users: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar usuários:', error)
          set({ loading: false })
        }
      },

      createUser: async (data: CreateUserData) => {
        set({ loading: true })
        try {
          const response = await api.post('/users', data)
          const newUser = response.data.data
          set(state => ({ 
            users: [newUser, ...state.users], 
            loading: false 
          }))
          return newUser
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateUser: async (id: number, data: UpdateUserData) => {
        set({ loading: true })
        try {
          const response = await api.put(`/users/${id}`, data)
          const updatedUser = response.data.data
          set(state => ({
            users: state.users.map(item => 
              item.id === id ? updatedUser : item
            ),
            selectedUser: state.selectedUser?.id === id 
              ? updatedUser 
              : state.selectedUser,
            loading: false
          }))
          return updatedUser
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deleteUser: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete(`/users/${id}`)
          set(state => ({
            users: state.users.filter(item => item.id !== id),
            selectedUser: state.selectedUser?.id === id 
              ? null 
              : state.selectedUser,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedUser: (user: User | null) => {
        set({ selectedUser: user })
      },

      setFilters: (filters: Partial<UserFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'user-store'
    }
  )
)