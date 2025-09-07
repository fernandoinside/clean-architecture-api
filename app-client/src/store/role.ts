import { create } from 'zustand'
import { api } from '@/lib/api'
import { Role, CreateRoleData, UpdateRoleData, RoleFilters, RoleStore } from '@/types'

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: [],
  selectedRole: null,
  loading: false,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: null,

  fetchRoles: async (filters) => {
    set({ loading: true })
    
    try {
      const currentFilters = filters || get().filters
      const response = await api.get('/roles', currentFilters)
      const pagination = (response.data as any).pagination || (response.data as any).meta
      
      set({ 
        roles: (response.data as any).data,
        pagination,
        filters: { ...currentFilters, limit: pagination?.limit ?? currentFilters.limit },
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar papéis:', error)
      set({ loading: false })
      throw error
    }
  },

  createRole: async (data: CreateRoleData) => {
    set({ loading: true })
    
    try {
      const response = await api.post('/roles', data)
      const newRole = response.data.data
      
      set(state => ({
        roles: [newRole, ...state.roles],
        loading: false
      }))
      
      return newRole
    } catch (error) {
      console.error('Erro ao criar papel:', error)
      set({ loading: false })
      throw error
    }
  },

  updateRole: async (id: number, data: UpdateRoleData) => {
    set({ loading: true })
    
    try {
      const response = await api.put(`/roles/${id}`, data)
      const updatedRole = response.data.data
      
      set(state => ({
        roles: state.roles.map(role => 
          role.id === id ? updatedRole : role
        ),
        selectedRole: state.selectedRole?.id === id ? updatedRole : state.selectedRole,
        loading: false
      }))
      
      return updatedRole
    } catch (error) {
      console.error('Erro ao atualizar papel:', error)
      set({ loading: false })
      throw error
    }
  },

  deleteRole: async (id: number) => {
    set({ loading: true })
    
    try {
      await api.delete(`/roles/${id}`)
      
      set(state => ({
        roles: state.roles.filter(role => role.id !== id),
        selectedRole: state.selectedRole?.id === id ? null : state.selectedRole,
        loading: false
      }))
    } catch (error) {
      console.error('Erro ao deletar papel:', error)
      set({ loading: false })
      throw error
    }
  },

  setSelectedRole: (role: Role | null) => {
    set({ selectedRole: role })
  },

  setFilters: (newFilters: Partial<RoleFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  }
}))