import { create } from 'zustand'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export interface PageStatic {
  id: number
  key: string
  title: string
  content?: string | null
  type?: 'page' | 'section' | 'banner' | 'config'
  is_active?: boolean
  order?: number
  metadata?: Record<string, any> | null
  created_at?: string
  updated_at?: string
}

export interface CreatePageStaticData {
  key: string
  title: string
  content?: string | null
  type?: 'page' | 'section' | 'banner' | 'config'
  is_active?: boolean
  order?: number
  metadata?: Record<string, any> | null
}

export interface UpdatePageStaticData extends Partial<CreatePageStaticData> {}

interface PageStaticFilters {
  search?: string
  type?: string
  isActive?: boolean
}

interface PageStaticPagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface PageStaticState {
  pageStatics: PageStatic[]
  selectedPageStatic: PageStatic | null
  loading: boolean
  filters: PageStaticFilters
  pagination: PageStaticPagination
  
  // Actions
  fetchPageStatics: () => Promise<void>
  createPageStatic: (data: CreatePageStaticData) => Promise<void>
  updatePageStatic: (id: number, data: UpdatePageStaticData) => Promise<void>
  deletePageStatic: (id: number) => Promise<void>
  activatePageStatic: (id: number) => Promise<void>
  deactivatePageStatic: (id: number) => Promise<void>
  duplicatePageStatic: (id: number, newKey: string, newTitle: string) => Promise<void>
  setSelectedPageStatic: (pageStatic: PageStatic | null) => void
  setFilters: (filters: Partial<PageStaticFilters>) => void
  setPagination: (pagination: Partial<PageStaticPagination>) => void
}

export const usePageStaticStore = create<PageStaticState>((set, get) => ({
  pageStatics: [],
  selectedPageStatic: null,
  loading: false,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },

  fetchPageStatics: async () => {
    const { filters, pagination } = get()
    set({ loading: true })
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive.toString() })
      })
      
      const response = await api.get(`/page-statics?${params}`)
      
      const responseData = response.data as any
      if (responseData?.success) {
        set({
          pageStatics: data.data?.items || [],
          pagination: {
            ...pagination,
            total: data.data?.total || 0,
            pages: data.data?.pages || 0
          }
        })
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao carregar páginas estáticas'
      toast.error(message)
    } finally {
      set({ loading: false })
    }
  },

  createPageStatic: async (data: CreatePageStaticData) => {
    set({ loading: true })
    
    try {
      const response = await api.post('/page-statics', data)
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Página estática criada com sucesso!')
        await get().fetchPageStatics()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao criar página estática'
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updatePageStatic: async (id: number, data: UpdatePageStaticData) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/page-statics/${id}`, data)
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Página estática atualizada com sucesso!')
        await get().fetchPageStatics()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao atualizar página estática'
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  deletePageStatic: async (id: number) => {
    set({ loading: true })
    
    try {
      const response = await api.delete(`/page-statics/${id}`)
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Página estática removida com sucesso!')
        await get().fetchPageStatics()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao remover página estática'
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  activatePageStatic: async (id: number) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/page-statics/${id}/activate`)
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Página estática ativada com sucesso!')
        await get().fetchPageStatics()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao ativar página estática'
      toast.error(message)
    } finally {
      set({ loading: false })
    }
  },

  deactivatePageStatic: async (id: number) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/page-statics/${id}/deactivate`)
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Página estática desativada com sucesso!')
        await get().fetchPageStatics()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao desativar página estática'
      toast.error(message)
    } finally {
      set({ loading: false })
    }
  },

  duplicatePageStatic: async (id: number, newKey: string, newTitle: string) => {
    set({ loading: true })
    
    try {
      const response = await api.post(`/page-statics/${id}/duplicate`, {
        newKey,
        newTitle
      })
      
      const responseData = response.data as any
      if (responseData?.success) {
        toast.success('Página estática duplicada com sucesso!')
        await get().fetchPageStatics()
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const message = err.response?.data?.message || 'Erro ao duplicar página estática'
      toast.error(message)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  setSelectedPageStatic: (pageStatic: PageStatic | null) => {
    set({ selectedPageStatic: pageStatic })
  },

  setFilters: (filters: Partial<PageStaticFilters>) => {
    set(state => ({ 
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }
    }))
  },

  setPagination: (pagination: Partial<PageStaticPagination>) => {
    set(state => ({ 
      pagination: { ...state.pagination, ...pagination }
    }))
  }
}))