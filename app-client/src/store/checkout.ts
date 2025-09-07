'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import {
  CheckoutStore,
  CheckoutFormData,
  PIXPaymentRequest,
  CardPaymentRequest,
  PIXPaymentResponse,
  CardPaymentResponse,
  PaymentStatus,
  CheckoutConfig
} from '@/types/checkout'

const initialState = {
  loading: false,
  error: null,
  step: 'form' as const,
  formData: {},
  config: null,
  currentPayment: null,
  paymentStatus: null,
  pollingInterval: null,
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Setters básicos
      setFormData: (data: Partial<CheckoutFormData>) => {
        set(state => ({
          formData: { ...state.formData, ...data }
        }))
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      setStep: (step: CheckoutStore['step']) => {
        set({ step })
      },

      // Carregar configurações do checkout
      loadConfig: async () => {
        try {
          set({ loading: true, error: null })
          const response = await api.get('/checkout/config')
          
          if (response.data.success) {
            set({ 
              config: response.data.data as CheckoutConfig,
              loading: false 
            })
          } else {
            throw new Error('Erro ao carregar configurações')
          }
        } catch (error: any) {
          console.error('Erro ao carregar config:', error)
          set({ 
            error: error.response?.data?.message || 'Erro ao carregar configurações',
            loading: false 
          })
          throw error
        }
      },

      // Criar pagamento PIX
      createPIXPayment: async (data: PIXPaymentRequest) => {
        try {
          set({ loading: true, error: null, step: 'processing' })
          
          const response = await api.post('/checkout/pix', data)
          
          if (response.data.success) {
            const paymentData = response.data.data as PIXPaymentResponse
            
            set({ 
              currentPayment: paymentData,
              loading: false,
              step: 'pix_waiting'
            })

            // Iniciar polling para verificar status
            get().startPolling(paymentData.transaction_id)
            
            return paymentData
          } else {
            throw new Error(response.data.message || 'Erro ao criar pagamento PIX')
          }
        } catch (error: any) {
          console.error('Erro ao criar PIX:', error)
          const errorMessage = error.response?.data?.message || 'Erro ao criar pagamento PIX'
          
          set({ 
            error: errorMessage,
            loading: false,
            step: 'error'
          })
          
          throw new Error(errorMessage)
        }
      },

      // Criar pagamento com cartão
      createCardPayment: async (data: CardPaymentRequest) => {
        try {
          set({ loading: true, error: null, step: 'processing' })
          
          const response = await api.post('/checkout/card', data)
          
          if (response.data.success) {
            const paymentData = response.data.data as CardPaymentResponse
            
            set({ 
              currentPayment: paymentData,
              loading: false,
              step: paymentData.status === 'approved' ? 'success' : 'error',
              error: paymentData.status === 'failed' ? paymentData.message : null
            })
            
            return paymentData
          } else {
            throw new Error(response.data.message || 'Erro ao processar pagamento')
          }
        } catch (error: any) {
          console.error('Erro ao processar cartão:', error)
          const errorMessage = error.response?.data?.message || 'Erro ao processar pagamento'
          
          set({ 
            error: errorMessage,
            loading: false,
            step: 'error'
          })
          
          throw new Error(errorMessage)
        }
      },

      // Verificar status do pagamento
      checkPaymentStatus: async (transactionId: string) => {
        try {
          const response = await api.get(`/checkout/status/${transactionId}`)
          
          if (response.data.success) {
            const statusData = response.data.data as PaymentStatus
            
            set({ paymentStatus: statusData })

            // Se o pagamento foi confirmado, parar o polling e marcar como sucesso
            if (statusData.status === 'completed') {
              get().stopPolling()
              set({ step: 'success' })
            } else if (statusData.status === 'failed') {
              get().stopPolling()
              set({ 
                step: 'error',
                error: 'Pagamento não foi confirmado'
              })
            }
            
            return statusData
          } else {
            throw new Error('Erro ao verificar status')
          }
        } catch (error: any) {
          console.error('Erro ao verificar status:', error)
          throw error
        }
      },

      // Iniciar polling para verificar status (usado para PIX)
      startPolling: (transactionId: string) => {
        // Parar qualquer polling anterior
        get().stopPolling()
        
        const interval = setInterval(async () => {
          try {
            await get().checkPaymentStatus(transactionId)
          } catch (error) {
            console.error('Erro no polling:', error)
          }
        }, 5000) // Verificar a cada 5 segundos
        
        set({ pollingInterval: interval })
      },

      // Parar polling
      stopPolling: () => {
        const { pollingInterval } = get()
        if (pollingInterval) {
          clearInterval(pollingInterval)
          set({ pollingInterval: null })
        }
      },

      // Reset do estado
      reset: () => {
        get().stopPolling()
        set({
          ...initialState,
          config: get().config // Manter config carregada
        })
      },

      // Validação de dados
      canSubmit: () => {
        const { formData } = get()
        return !!(
          formData.plan_id &&
          formData.subscription_type &&
          formData.customer_data?.name &&
          formData.customer_data?.email &&
          formData.customer_data?.document &&
          formData.payment_method &&
          (formData.subscription_type === 'company' ? formData.company_id : formData.customer_id)
        )
      }
    }),
    {
      name: 'checkout-store',
      // Não persistir intervalos e estados temporários
      partialize: (state) => ({
        config: state.config,
        formData: state.formData
      })
    }
  )
)

// Hook para facilitar o uso
export const useCheckout = () => {
  const store = useCheckoutStore()
  
  return {
    // Estado
    ...store,
    
    // Helpers
    isLoading: store.loading,
    hasError: !!store.error,
    isProcessing: store.step === 'processing',
    isWaitingPIX: store.step === 'pix_waiting',
    isSuccess: store.step === 'success',
    isError: store.step === 'error',
    
    // Validações
    canSubmit: () => {
      const { formData } = store
      return !!(
        formData.plan_id &&
        formData.subscription_type &&
        formData.customer_data?.name &&
        formData.customer_data?.email &&
        formData.customer_data?.document &&
        formData.payment_method &&
        (formData.subscription_type === 'company' ? formData.company_id : formData.customer_id)
      )
    },
    
    // Actions combinadas
    submitCheckout: async () => {
      const { formData } = store
      
      if (!store.canSubmit()) {
        throw new Error('Dados do formulário incompletos')
      }

      const baseData = {
        plan_id: formData.plan_id!,
        subscription_type: formData.subscription_type!,
        customer_data: formData.customer_data!,
        ...(formData.subscription_type === 'company' 
          ? { company_id: formData.company_id! } 
          : { customer_id: formData.customer_id! }
        )
      }

      if (formData.payment_method === 'pix') {
        return await store.createPIXPayment(baseData as PIXPaymentRequest)
      } else {
        if (!formData.card_data) {
          throw new Error('Dados do cartão são obrigatórios')
        }
        
        return await store.createCardPayment({
          ...baseData,
          card_data: formData.card_data,
          billing_address: formData.billing_address || formData.customer_data!.address
        } as CardPaymentRequest)
      }
    }
  }
}