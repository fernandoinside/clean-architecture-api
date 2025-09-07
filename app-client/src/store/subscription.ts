'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionFilters, SubscriptionStore } from '@/types'

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      selectedSubscription: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchSubscriptions: async (filters?: SubscriptionFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get('/subscriptions', { params })
          const { data, pagination } = response.data
          set({ 
            subscriptions: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar assinaturas:', error)
          set({ loading: false })
        }
      },

      createSubscription: async (data: CreateSubscriptionData) => {
        set({ loading: true })
        try {
          const response = await api.post('/subscriptions', data)
          const newSubscription = response.data.data
          set(state => ({ 
            subscriptions: [newSubscription, ...state.subscriptions], 
            loading: false 
          }))
          return newSubscription
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateSubscription: async (id: number, data: UpdateSubscriptionData) => {
        set({ loading: true })
        try {
          const response = await api.put(`/subscriptions/${id}`, data)
          const updatedSubscription = response.data.data
          set(state => ({
            subscriptions: state.subscriptions.map(item => 
              item.id === id ? updatedSubscription : item
            ),
            selectedSubscription: state.selectedSubscription?.id === id 
              ? updatedSubscription 
              : state.selectedSubscription,
            loading: false
          }))
          return updatedSubscription
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deleteSubscription: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete(`/subscriptions/${id}`)
          set(state => ({
            subscriptions: state.subscriptions.filter(item => item.id !== id),
            selectedSubscription: state.selectedSubscription?.id === id 
              ? null 
              : state.selectedSubscription,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedSubscription: (subscription: Subscription | null) => {
        set({ selectedSubscription: subscription })
      },

      setFilters: (filters: Partial<SubscriptionFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'subscription-store'
    }
  )
)