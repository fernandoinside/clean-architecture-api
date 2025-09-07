import { create } from 'zustand'
import api, { ApiListResponse, ApiResponse } from '@/lib/api'
import { Permission, CreatePermissionData, UpdatePermissionData, PermissionFilters, PermissionStore } from '@/types'

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  permissions: [],
  selectedPermission: null,
  loading: false,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: null,

  fetchPermissions: async (filters) => {
    set({ loading: true })
    
    try {
      const currentFilters = filters || get().filters
      console.log('Buscando permissões com filtros:', currentFilters)
      const response = await api.get<ApiListResponse<Permission>>('/permissions', currentFilters)
      console.log('Resposta da API:', response.data)

      const resp = response.data
      type PaginationMeta = { total: number; page: number; limit: number; totalPages: number }
      const maybe = resp as unknown as { pagination?: PaginationMeta; meta?: PaginationMeta }
      const pagination = maybe.pagination ?? maybe.meta
      const serverLimit = pagination?.limit ?? currentFilters.limit

      set({ 
        permissions: response.data.data,
        pagination,
        filters: { ...currentFilters, limit: serverLimit },
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar permissões:', error)
      set({ loading: false })
      throw error
    }
  },

  createPermission: async (data: CreatePermissionData) => {
    set({ loading: true })
    
    try {
      const response = await api.post<ApiResponse<Permission>>('/permissions', data)
      const newPermission = response.data.data
      
      set(state => ({
        permissions: [newPermission, ...state.permissions],
        loading: false
      }))
      
      return newPermission
    } catch (error) {
      console.error('Erro ao criar permissão:', error)
      set({ loading: false })
      throw error
    }
  },

  updatePermission: async (id: number, data: UpdatePermissionData) => {
    set({ loading: true })
    
    try {
      const response = await api.put<ApiResponse<Permission>>(`/permissions/${id}`, data)
      const updatedPermission = response.data.data
      
      set(state => ({
        permissions: state.permissions.map(permission => 
          permission.id === id ? updatedPermission : permission
        ),
        selectedPermission: state.selectedPermission?.id === id ? updatedPermission : state.selectedPermission,
        loading: false
      }))
      
      return updatedPermission
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error)
      set({ loading: false })
      throw error
    }
  },

  deletePermission: async (id: number) => {
    set({ loading: true })
    
    try {
      await api.delete(`/permissions/${id}`)
      
      set(state => ({
        permissions: state.permissions.filter(permission => permission.id !== id),
        selectedPermission: state.selectedPermission?.id === id ? null : state.selectedPermission,
        loading: false
      }))
    } catch (error) {
      console.error('Erro ao deletar permissão:', error)
      set({ loading: false })
      throw error
    }
  },

  setSelectedPermission: (permission: Permission | null) => {
    set({ selectedPermission: permission })
  },

  setFilters: (newFilters: Partial<PermissionFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  }
}))