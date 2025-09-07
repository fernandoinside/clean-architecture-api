'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { Notification, CreateNotificationData, UpdateNotificationData, NotificationFilters, NotificationStore } from '@/types'

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      selectedNotification: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchNotifications: async (filters?: NotificationFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get('/notifications', { params })
          const { data, pagination } = response.data
          set({ 
            notifications: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar notificações:', error)
          set({ loading: false })
        }
      },

      createNotification: async (data: CreateNotificationData) => {
        set({ loading: true })
        try {
          const response = await api.post('/notifications', data)
          const newNotification = response.data.data
          set(state => ({ 
            notifications: [newNotification, ...state.notifications], 
            loading: false 
          }))
          return newNotification
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateNotification: async (id: number, data: UpdateNotificationData) => {
        set({ loading: true })
        try {
          const response = await api.put(`/notifications/${id}`, data)
          const updatedNotification = response.data.data
          set(state => ({
            notifications: state.notifications.map(item => 
              item.id === id ? updatedNotification : item
            ),
            selectedNotification: state.selectedNotification?.id === id 
              ? updatedNotification 
              : state.selectedNotification,
            loading: false
          }))
          return updatedNotification
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deleteNotification: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete(`/notifications/${id}`)
          set(state => ({
            notifications: state.notifications.filter(item => item.id !== id),
            selectedNotification: state.selectedNotification?.id === id 
              ? null 
              : state.selectedNotification,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      markAsRead: async (id: number) => {
        set({ loading: true })
        try {
          const response = await api.patch(`/notifications/${id}/read`)
          const updatedNotification = response.data.data
          set(state => ({
            notifications: state.notifications.map(item => 
              item.id === id ? updatedNotification : item
            ),
            selectedNotification: state.selectedNotification?.id === id 
              ? updatedNotification 
              : state.selectedNotification,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      markAllAsRead: async (userId: number) => {
        set({ loading: true })
        try {
          await api.patch(`/notifications/mark-all-read`, { user_id: userId })
          set(state => ({
            notifications: state.notifications.map(item => 
              !item.is_read ? { ...item, is_read: true } : item
            ),
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedNotification: (notification: Notification | null) => {
        set({ selectedNotification: notification })
      },

      setFilters: (filters: Partial<NotificationFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'notification-store'
    }
  )
)