import { create } from 'zustand'
import { api } from '@/lib/api'
import { 
  RolePermissionDetailed, 
  RolePermission, 
  CreateRolePermissionData, 
  SetRolePermissionsData, 
  RolePermissionFilters, 
  RolePermissionStore 
} from '@/types'

export const useRolePermissionStore = create<RolePermissionStore>((set, get) => ({
  rolePermissions: [],
  selectedRolePermission: null,
  loading: false,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: null,

  fetchRolePermissions: async (filters) => {
    set({ loading: true })
    
    try {
      const currentFilters = filters || get().filters
      const response = await api.get('/role-permissions', currentFilters)
      const pagination = (response.data as any).pagination || (response.data as any).meta
      
      set({ 
        rolePermissions: (response.data as any).data,
        pagination,
        filters: { ...currentFilters, limit: pagination?.limit ?? currentFilters.limit },
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar role-permissions:', error)
      set({ loading: false })
      throw error
    }
  },

  fetchRolePermissionsByRole: async (roleId: number) => {
    set({ loading: true })
    
    try {
      const response = await api.get(`/role-permissions/roles/${roleId}/permissions`)
      
      set({ 
        rolePermissions: response.data.data,
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar permissões do papel:', error)
      set({ loading: false })
      throw error
    }
  },

  fetchRolePermissionsByPermission: async (permissionId: number) => {
    set({ loading: true })
    
    try {
      const response = await api.get(`/role-permissions/permissions/${permissionId}/roles`)
      
      set({ 
        rolePermissions: response.data.data,
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar papéis da permissão:', error)
      set({ loading: false })
      throw error
    }
  },

  createRolePermission: async (data: CreateRolePermissionData) => {
    set({ loading: true })
    
    try {
      const response = await api.post('/role-permissions', data)
      const newRolePermission = response.data.data
      
      set(state => ({
        rolePermissions: [newRolePermission, ...state.rolePermissions],
        loading: false
      }))
      
      return newRolePermission
    } catch (error) {
      console.error('Erro ao criar role-permission:', error)
      set({ loading: false })
      throw error
    }
  },

  setRolePermissions: async (roleId: number, data: SetRolePermissionsData) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/role-permissions/roles/${roleId}/permissions`, data)
      
      set({ 
        rolePermissions: response.data.data,
        loading: false
      })
    } catch (error) {
      console.error('Erro ao definir permissões do papel:', error)
      set({ loading: false })
      throw error
    }
  },

  deleteRolePermission: async (id: number) => {
    set({ loading: true })
    
    try {
      await api.delete(`/role-permissions/${id}`)
      
      set(state => ({
        rolePermissions: state.rolePermissions.filter(rp => rp.id !== id),
        selectedRolePermission: state.selectedRolePermission?.id === id ? null : state.selectedRolePermission,
        loading: false
      }))
    } catch (error) {
      console.error('Erro ao deletar role-permission:', error)
      set({ loading: false })
      throw error
    }
  },

  setSelectedRolePermission: (rolePermission: RolePermissionDetailed | null) => {
    set({ selectedRolePermission: rolePermission })
  },

  setFilters: (newFilters: Partial<RolePermissionFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  }
}))