import { create } from 'zustand'
import { api } from '@/lib/api'
import { 
  UserRoleDetailed, 
  UserRole, 
  CreateUserRoleData, 
  UserRoleFilters, 
  UserRoleStore 
} from '@/types'

export const useUserRoleStore = create<UserRoleStore>((set, get) => ({
  userRoles: [],
  selectedUserRole: null,
  loading: false,
  filters: {
    page: 1,
    limit: 10
  },
  pagination: null,

  fetchUserRoles: async (filters) => {
    set({ loading: true })
    
    try {
      const currentFilters = filters || get().filters
      const response = await api.get('/user-roles', currentFilters)
      const pagination = (response.data as any).pagination || (response.data as any).meta
      
      set({ 
        userRoles: (response.data as any).data,
        pagination,
        filters: { ...currentFilters, limit: pagination?.limit ?? currentFilters.limit },
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar user-roles:', error)
      set({ loading: false })
      throw error
    }
  },

  fetchUserRolesByUser: async (userId: number) => {
    set({ loading: true })
    
    try {
      const response = await api.get('/user-roles', { user_id: userId })
      
      set({ 
        userRoles: response.data.data,
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar papéis do usuário:', error)
      set({ loading: false })
      throw error
    }
  },

  fetchUserRolesByRole: async (roleId: number) => {
    set({ loading: true })
    
    try {
      const response = await api.get('/user-roles', { role_id: roleId })
      
      set({ 
        userRoles: response.data.data,
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar usuários do papel:', error)
      set({ loading: false })
      throw error
    }
  },

  createUserRole: async (data: CreateUserRoleData) => {
    set({ loading: true })
    
    try {
      const response = await api.post('/user-roles', data)
      const newUserRole = response.data.data
      
      set(state => ({
        userRoles: [newUserRole, ...state.userRoles],
        loading: false
      }))
      
      return newUserRole
    } catch (error) {
      console.error('Erro ao criar user-role:', error)
      set({ loading: false })
      throw error
    }
  },

  deleteUserRole: async (id: number) => {
    set({ loading: true })
    
    try {
      await api.delete(`/user-roles/${id}`)
      
      set(state => ({
        userRoles: state.userRoles.filter(ur => ur.id !== id),
        selectedUserRole: state.selectedUserRole?.id === id ? null : state.selectedUserRole,
        loading: false
      }))
    } catch (error) {
      console.error('Erro ao deletar user-role:', error)
      set({ loading: false })
      throw error
    }
  },

  setSelectedUserRole: (userRole: UserRoleDetailed | null) => {
    set({ selectedUserRole: userRole })
  },

  setFilters: (newFilters: Partial<UserRoleFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  }
}))