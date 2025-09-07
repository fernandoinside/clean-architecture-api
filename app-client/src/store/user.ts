import { create } from 'zustand'
import { api, ApiListResponse } from '@/lib/api'

// Interfaces básicas para User (baseadas na documentação)
interface UserFromAPI {
  id: number
  username: string
  email: string
  first_name?: string | null
  last_name?: string | null
  role_id?: number | null
  company_id?: number | null
  is_active: boolean
  email_verified?: boolean
  created_at: string
  updated_at: string
}

interface UserFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  role_id?: number
  company_id?: number
}

interface UserStore {
  users: UserFromAPI[]
  selectedUser: UserFromAPI | null
  loading: boolean
  filters: UserFilters
  pagination: any
  
  fetchUsers: (filters?: UserFilters) => Promise<void>
  setSelectedUser: (user: UserFromAPI | null) => void
  setFilters: (filters: Partial<UserFilters>) => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  selectedUser: null,
  loading: false,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: null,

  fetchUsers: async (filters) => {
    set({ loading: true })
    
    try {
      const currentFilters = filters || get().filters
      const response = await api.get<ApiListResponse<UserFromAPI>>('/users', currentFilters)
      const resp = response.data
      type PaginationMeta = { total: number; page: number; limit: number; totalPages: number }
      const maybe = resp as unknown as { pagination?: PaginationMeta; meta?: PaginationMeta }
      const pagination = maybe.pagination ?? maybe.meta
      
      set({ 
        users: resp.data,
        pagination,
        filters: { ...currentFilters, limit: pagination?.limit ?? currentFilters.limit },
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      set({ loading: false })
      throw error
    }
  },

  setSelectedUser: (user: UserFromAPI | null) => {
    set({ selectedUser: user })
  },

  setFilters: (newFilters: Partial<UserFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  }
}))