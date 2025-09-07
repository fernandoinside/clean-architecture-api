'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { Payment, CreatePaymentData, UpdatePaymentData, PaymentFilters, PaymentStore } from '@/types'

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      payments: [],
      selectedPayment: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchPayments: async (filters?: PaymentFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get('/payments', { params })
          const { data, pagination } = response.data
          set({ 
            payments: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar pagamentos:', error)
          set({ loading: false })
        }
      },

      createPayment: async (data: CreatePaymentData) => {
        set({ loading: true })
        try {
          const response = await api.post('/payments', data)
          const newPayment = response.data.data
          set(state => ({ 
            payments: [newPayment, ...state.payments], 
            loading: false 
          }))
          return newPayment
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updatePayment: async (id: number, data: UpdatePaymentData) => {
        set({ loading: true })
        try {
          const response = await api.put(`/payments/${id}`, data)
          const updatedPayment = response.data.data
          set(state => ({
            payments: state.payments.map(item => 
              item.id === id ? updatedPayment : item
            ),
            selectedPayment: state.selectedPayment?.id === id 
              ? updatedPayment 
              : state.selectedPayment,
            loading: false
          }))
          return updatedPayment
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deletePayment: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete(`/payments/${id}`)
          set(state => ({
            payments: state.payments.filter(item => item.id !== id),
            selectedPayment: state.selectedPayment?.id === id 
              ? null 
              : state.selectedPayment,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedPayment: (payment: Payment | null) => {
        set({ selectedPayment: payment })
      },

      setFilters: (filters: Partial<PaymentFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'payment-store'
    }
  )
)