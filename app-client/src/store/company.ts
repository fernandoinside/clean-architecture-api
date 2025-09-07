import { create } from 'zustand'
import { CompanyStore, Company, CreateCompanyData, UpdateCompanyData, CompanyFilters } from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],
  selectedCompany: null,
  loading: false,
  filters: {
    page: 1,
    limit: 10,
  },
  pagination: null,

  fetchCompanies: async (filters?: CompanyFilters) => {
    try {
      set({ loading: true })
      
      const currentFilters = { ...get().filters, ...filters }
      const response = await api.companies.list(currentFilters)
      
      set({
        companies: response.data.data,
        pagination: response.data.meta,
        filters: currentFilters,
        loading: false,
      })
    } catch (error: any) {
      set({ loading: false })
      const message = error.response?.data?.message || 'Erro ao carregar empresas'
      toast.error(message)
    }
  },

  createCompany: async (data: CreateCompanyData) => {
    try {
      const response = await api.companies.create(data)
      const newCompany = response.data.data

      set((state) => ({
        companies: [newCompany, ...state.companies],
      }))

      toast.success('Empresa criada com sucesso!')
      return newCompany
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar empresa'
      toast.error(message)
      throw error
    }
  },

  updateCompany: async (id: number, data: UpdateCompanyData) => {
    try {
      const response = await api.companies.update(id, data)
      const updatedCompany = response.data.data

      set((state) => ({
        companies: state.companies.map((company) =>
          company.id === id ? updatedCompany : company
        ),
        selectedCompany: state.selectedCompany?.id === id ? updatedCompany : state.selectedCompany,
      }))

      toast.success('Empresa atualizada com sucesso!')
      return updatedCompany
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar empresa'
      toast.error(message)
      throw error
    }
  },

  deleteCompany: async (id: number) => {
    try {
      await api.companies.delete(id)

      set((state) => ({
        companies: state.companies.filter((company) => company.id !== id),
        selectedCompany: state.selectedCompany?.id === id ? null : state.selectedCompany,
      }))

      toast.success('Empresa removida com sucesso!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover empresa'
      toast.error(message)
      throw error
    }
  },

  setSelectedCompany: (company: Company | null) => {
    set({ selectedCompany: company })
  },

  setFilters: (filters: Partial<CompanyFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },
}))