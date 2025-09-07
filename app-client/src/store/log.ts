import { create } from 'zustand'
import { api, ApiListResponse, ApiResponse } from '@/lib/api'
import { Log, CreateLogData, UpdateLogData, LogFilters, LogStore } from '@/types'

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],
  selectedLog: null,
  loading: false,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: null,

  fetchLogs: async (filters) => {
    set({ loading: true })
    
    try {
      const currentFilters = filters || get().filters
      const response = await api.get<ApiListResponse<Log>>('/logs', currentFilters)
      const resp = response.data
      const pagination = (resp as any).pagination || resp.meta
      
      set({ 
        logs: resp.data,
        pagination,
        filters: { ...currentFilters, limit: pagination?.limit ?? currentFilters.limit },
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      set({ loading: false })
      throw error
    }
  },

  createLog: async (data: CreateLogData) => {
    set({ loading: true })
    
    try {
      const response = await api.post('/logs', data)
      const newLog = response.data.data
      
      set(state => ({
        logs: [newLog, ...state.logs],
        loading: false
      }))
      
      return newLog
    } catch (error) {
      console.error('Erro ao criar log:', error)
      set({ loading: false })
      throw error
    }
  },

  updateLog: async (id: number, data: UpdateLogData) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/logs/${id}`, data)
      const updatedLog = response.data.data
      
      set(state => ({
        logs: state.logs.map(log => 
          log.id === id ? updatedLog : log
        ),
        selectedLog: state.selectedLog?.id === id ? updatedLog : state.selectedLog,
        loading: false
      }))
      
      return updatedLog
    } catch (error) {
      console.error('Erro ao atualizar log:', error)
      set({ loading: false })
      throw error
    }
  },

  deleteLog: async (id: number) => {
    set({ loading: true })
    
    try {
      await api.delete(`/logs/${id}`)
      
      set(state => ({
        logs: state.logs.filter(log => log.id !== id),
        selectedLog: state.selectedLog?.id === id ? null : state.selectedLog,
        loading: false
      }))
    } catch (error) {
      console.error('Erro ao deletar log:', error)
      set({ loading: false })
      throw error
    }
  },

  setSelectedLog: (log: Log | null) => {
    set({ selectedLog: log })
  },

  setFilters: (newFilters: Partial<LogFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  }
}))