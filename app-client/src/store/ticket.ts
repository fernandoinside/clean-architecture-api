import { create } from 'zustand'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export interface Ticket {
  id: number
  title: string
  description: string
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'support' | 'contact' | 'technical' | 'billing' | 'feature_request' | 'bug_report'
  user_id: number
  assigned_to?: number
  company_id?: number
  attachments?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
  }
  assigned_user?: {
    id: number
    name: string
    email: string
  }
  company?: {
    id: number
    name: string
  }
}

export interface CreateTicketData {
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category: 'support' | 'contact' | 'technical' | 'billing' | 'feature_request' | 'bug_report'
  attachments?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  status?: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
  assigned_to?: number
}

interface TicketFilters {
  search?: string
  status?: string
  priority?: string
  category?: string
  assigned_to?: number
  user_id?: number
  company_id?: number
}

interface TicketPagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface TicketState {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  loading: boolean
  filters: TicketFilters
  pagination: TicketPagination
  
  // Actions
  fetchTickets: () => Promise<void>
  createTicket: (data: CreateTicketData) => Promise<void>
  updateTicket: (id: number, data: UpdateTicketData) => Promise<void>
  deleteTicket: (id: number) => Promise<void>
  assignTicket: (id: number, userId: number) => Promise<void>
  changeStatus: (id: number, status: Ticket['status']) => Promise<void>
  setSelectedTicket: (ticket: Ticket | null) => void
  setFilters: (filters: Partial<TicketFilters>) => void
  setPagination: (pagination: Partial<TicketPagination>) => void
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  selectedTicket: null,
  loading: false,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },

  fetchTickets: async () => {
    const { filters, pagination } = get()
    set({ loading: true })
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.category && { category: filters.category }),
        ...(filters.assigned_to && { assigned_to: filters.assigned_to.toString() }),
        ...(filters.user_id && { user_id: filters.user_id.toString() }),
        ...(filters.company_id && { company_id: filters.company_id.toString() })
      })
      
      const response = await api.get(`/tickets?${params}`)
      
      const data = response.data as any
      if (data?.success) {
        set({
          tickets: data.data?.items || [],
          pagination: {
            ...pagination,
            total: data.data?.total || 0,
            pages: data.data?.pages || 0
          }
        })
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao carregar tickets'
      toast.error(message)
    } finally {
      set({ loading: false })
    }
  },

  createTicket: async (data: CreateTicketData) => {
    set({ loading: true })
    
    try {
      const response = await api.post('/tickets', data)
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Ticket criado com sucesso!')
        await get().fetchTickets()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao criar ticket'
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateTicket: async (id: number, data: UpdateTicketData) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/tickets/${id}`, data)
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Ticket atualizado com sucesso!')
        await get().fetchTickets()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao atualizar ticket'
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deleteTicket: async (id: number) => {
    set({ loading: true })
    
    try {
      const response = await api.delete(`/tickets/${id}`)
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Ticket removido com sucesso!')
        await get().fetchTickets()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao remover ticket'
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  assignTicket: async (id: number, userId: number) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/tickets/${id}/assign`, { assigned_to: userId })
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Ticket atribuído com sucesso!')
        await get().fetchTickets()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao atribuir ticket'
      toast.error(message)
    } finally {
      set({ loading: false })
    }
  },

  changeStatus: async (id: number, status: Ticket['status']) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/tickets/${id}/status`, { status })
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Status do ticket atualizado com sucesso!')
        await get().fetchTickets()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao atualizar status do ticket'
      toast.error(message)
    } finally {
      set({ loading: false })
    }
  },

  setSelectedTicket: (ticket: Ticket | null) => {
    set({ selectedTicket: ticket })
  },

  setFilters: (filters: Partial<TicketFilters>) => {
    set(state => ({ 
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }
    }))
  },

  setPagination: (pagination: Partial<TicketPagination>) => {
    set(state => ({ 
      pagination: { ...state.pagination, ...pagination }
    }))
  }
}))