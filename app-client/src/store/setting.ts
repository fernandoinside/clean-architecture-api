'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { Setting, CreateSettingData, UpdateSettingData, SettingFilters, SettingStore } from '@/types'

export const useSettingStore = create<SettingStore>()(
  persist(
    (set, get) => ({
      settings: [],
      selectedSetting: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchSettings: async (filters?: SettingFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get<{ success: boolean; data: Setting[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
            '/settings',
            { params }
          )
          const { data, pagination } = response.data
          set({ 
            settings: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar configurações:', error)
          set({ loading: false })
        }
      },

      createSetting: async (data: CreateSettingData) => {
        set({ loading: true })
        try {
          const response = await api.post<{ success: boolean; message?: string; data: Setting }>(
            '/settings',
            data
          )
          const newSetting = response.data.data
          set(state => ({ 
            settings: [newSetting, ...state.settings], 
            loading: false 
          }))
          return newSetting
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateSetting: async (id: number, data: UpdateSettingData) => {
        set({ loading: true })
        try {
          const response = await api.put<{ success: boolean; message?: string; data: Setting }>(
            `/settings/${id}`,
            data
          )
          const updatedSetting = response.data.data
          set(state => ({
            settings: state.settings.map(item => 
              item.id === id ? updatedSetting : item
            ),
            selectedSetting: state.selectedSetting?.id === id 
              ? updatedSetting 
              : state.selectedSetting,
            loading: false
          }))
          return updatedSetting
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deleteSetting: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete<{ success: boolean; message: string }>(`/settings/${id}`)
          set(state => ({
            settings: state.settings.filter(item => item.id !== id),
            selectedSetting: state.selectedSetting?.id === id 
              ? null 
              : state.selectedSetting,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedSetting: (setting: Setting | null) => {
        set({ selectedSetting: setting })
      },

      setFilters: (filters: Partial<SettingFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'setting-store'
    }
  )
)