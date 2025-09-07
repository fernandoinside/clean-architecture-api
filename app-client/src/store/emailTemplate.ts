'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { EmailTemplate, CreateEmailTemplateData, UpdateEmailTemplateData, EmailTemplateFilters, EmailTemplateStore } from '@/types'

export const useEmailTemplateStore = create<EmailTemplateStore>()(
  persist(
    (set, get) => ({
      emailTemplates: [],
      selectedEmailTemplate: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchEmailTemplates: async (filters?: EmailTemplateFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get('/email-templates', { params })
          const { data, pagination } = response.data
          set({ 
            emailTemplates: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar email templates:', error)
          set({ loading: false })
        }
      },

      createEmailTemplate: async (data: CreateEmailTemplateData) => {
        set({ loading: true })
        try {
          const response = await api.post('/email-templates', data)
          const newEmailTemplate = response.data.data
          set(state => ({ 
            emailTemplates: [newEmailTemplate, ...state.emailTemplates], 
            loading: false 
          }))
          return newEmailTemplate
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateEmailTemplate: async (id: number, data: UpdateEmailTemplateData) => {
        set({ loading: true })
        try {
          const response = await api.put(`/email-templates/${id}`, data)
          const updatedEmailTemplate = response.data.data
          set(state => ({
            emailTemplates: state.emailTemplates.map(item => 
              item.id === id ? updatedEmailTemplate : item
            ),
            selectedEmailTemplate: state.selectedEmailTemplate?.id === id 
              ? updatedEmailTemplate 
              : state.selectedEmailTemplate,
            loading: false
          }))
          return updatedEmailTemplate
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deleteEmailTemplate: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete(`/email-templates/${id}`)
          set(state => ({
            emailTemplates: state.emailTemplates.filter(item => item.id !== id),
            selectedEmailTemplate: state.selectedEmailTemplate?.id === id 
              ? null 
              : state.selectedEmailTemplate,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedEmailTemplate: (emailTemplate: EmailTemplate | null) => {
        set({ selectedEmailTemplate: emailTemplate })
      },

      setFilters: (filters: Partial<EmailTemplateFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'email-template-store'
    }
  )
)