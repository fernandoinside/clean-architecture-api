'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { Plan, CreatePlanData, UpdatePlanData, PlanFilters, PlanStore } from '@/types'

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plans: [],
      selectedPlan: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchPlans: async (filters?: PlanFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get('/plans', { params })
          const { data, pagination } = response.data
          set({ 
            plans: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar planos:', error)
          set({ loading: false })
        }
      },

      createPlan: async (data: CreatePlanData) => {
        set({ loading: true })
        try {
          const response = await api.post('/plans', data)
          const newPlan = response.data.data
          set(state => ({ 
            plans: [newPlan, ...state.plans], 
            loading: false 
          }))
          return newPlan
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updatePlan: async (id: number, data: UpdatePlanData) => {
        set({ loading: true })
        try {
          const response = await api.put(`/plans/${id}`, data)
          const updatedPlan = response.data.data
          set(state => ({
            plans: state.plans.map(item => 
              item.id === id ? updatedPlan : item
            ),
            selectedPlan: state.selectedPlan?.id === id 
              ? updatedPlan 
              : state.selectedPlan,
            loading: false
          }))
          return updatedPlan
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deletePlan: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete(`/plans/${id}`)
          set(state => ({
            plans: state.plans.filter(item => item.id !== id),
            selectedPlan: state.selectedPlan?.id === id 
              ? null 
              : state.selectedPlan,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedPlan: (plan: Plan | null) => {
        set({ selectedPlan: plan })
      },

      setFilters: (filters: Partial<PlanFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'plan-store'
    }
  )
)