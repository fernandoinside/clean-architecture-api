import { create } from 'zustand'
import { 
  CustomerStore, 
  Customer, 
  CustomerAddress,
  CreateCustomerData, 
  UpdateCustomerData,
  CreateCustomerAddressData,
  UpdateCustomerAddressData,
  CustomerFilters 
} from '@/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  addresses: [],
  loading: false,
  filters: {
    page: 1,
    limit: 10,
  },
  pagination: null,

  // === CUSTOMER ACTIONS ===
  fetchCustomers: async (filters?: CustomerFilters) => {
    try {
      set({ loading: true })
      
      const currentFilters = { ...get().filters, ...filters }
      const response = await api.customers.list(currentFilters)
      
      set({
        customers: response.data.data,
        pagination: response.data.meta,
        filters: currentFilters,
        loading: false,
      })
    } catch (error: any) {
      set({ loading: false })
      const message = error.response?.data?.message || 'Erro ao carregar clientes'
      toast.error(message)
    }
  },

  createCustomer: async (data: CreateCustomerData) => {
    try {
      const response = await api.customers.create(data)
      const newCustomer = response.data.data

      set((state) => ({
        customers: [newCustomer, ...state.customers],
      }))

      toast.success('Cliente criado com sucesso!')
      return newCustomer
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar cliente'
      toast.error(message)
      throw error
    }
  },

  updateCustomer: async (id: number, data: UpdateCustomerData) => {
    try {
      const response = await api.customers.update(id, data)
      const updatedCustomer = response.data.data

      set((state) => ({
        customers: state.customers.map((customer) =>
          customer.id === id ? updatedCustomer : customer
        ),
        selectedCustomer: state.selectedCustomer?.id === id ? updatedCustomer : state.selectedCustomer,
      }))

      toast.success('Cliente atualizado com sucesso!')
      return updatedCustomer
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar cliente'
      toast.error(message)
      throw error
    }
  },

  deleteCustomer: async (id: number) => {
    try {
      await api.customers.delete(id)

      set((state) => ({
        customers: state.customers.filter((customer) => customer.id !== id),
        selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
      }))

      toast.success('Cliente removido com sucesso!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover cliente'
      toast.error(message)
      throw error
    }
  },

  setSelectedCustomer: (customer: Customer | null) => {
    set({ selectedCustomer: customer })
  },

  // === ADDRESS ACTIONS ===
  fetchCustomerAddresses: async (customerId: number) => {
    try {
      const response = await api.customerAddresses.list({ customer_id: customerId })
      set({ addresses: response.data.data })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar endereços'
      toast.error(message)
    }
  },

  createCustomerAddress: async (data: CreateCustomerAddressData) => {
    try {
      const response = await api.customerAddresses.create(data)
      const newAddress = response.data.data

      set((state) => ({
        addresses: [...state.addresses, newAddress],
      }))

      toast.success('Endereço criado com sucesso!')
      return newAddress
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar endereço'
      toast.error(message)
      throw error
    }
  },

  updateCustomerAddress: async (id: number, data: UpdateCustomerAddressData) => {
    try {
      const response = await api.customerAddresses.update(id, data)
      const updatedAddress = response.data.data

      set((state) => ({
        addresses: state.addresses.map((address) =>
          address.id === id ? updatedAddress : address
        ),
      }))

      toast.success('Endereço atualizado com sucesso!')
      return updatedAddress
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar endereço'
      toast.error(message)
      throw error
    }
  },

  deleteCustomerAddress: async (id: number) => {
    try {
      await api.customerAddresses.delete(id)

      set((state) => ({
        addresses: state.addresses.filter((address) => address.id !== id),
      }))

      toast.success('Endereço removido com sucesso!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover endereço'
      toast.error(message)
      throw error
    }
  },

  setDefaultAddress: async (id: number, customerId: number) => {
    try {
      const response = await api.customerAddresses.setDefault(id, customerId)
      const updatedAddress = response.data.data

      // Atualiza lista: remove is_default dos outros e define no selecionado
      set((state) => ({
        addresses: state.addresses.map((address) => ({
          ...address,
          is_default: address.id === id ? true : false,
        })),
      }))

      toast.success('Endereço definido como padrão!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao definir endereço padrão'
      toast.error(message)
      throw error
    }
  },

  setFilters: (filters: Partial<CustomerFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },
}))