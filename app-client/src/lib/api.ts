import axios, { AxiosInstance, AxiosResponse } from 'axios'

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Interface para respostas padronizadas da API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Cliente HTTP configurado
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Interceptor de requisições - adiciona token automaticamente
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    })

    // Interceptor de respostas - trata erros globalmente
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          // Token expirado - remove token e redireciona para login
          localStorage.removeItem('auth_token')
          
          // Import dinâmico para evitar problemas de SSR
          const { useAuthStore } = await import('@/store/auth')
          useAuthStore.getState().logout()
          
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP genéricos
  async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params })
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data)
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data)
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url)
  }

  async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data)
  }

  // === AUTHENTICATION ===
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.post<ApiResponse<{ user: any; token: string }>>('/auth/login', credentials),
    
    register: (data: { username: string; email: string; password: string; confirmPassword: string; firstName?: string; lastName?: string; companyId?: number }) =>
      this.post<ApiResponse<{ user: any; token?: string }>>('/auth/register', data),
    
    logout: () =>
      this.post<ApiResponse<null>>('/auth/logout'),
    
    refresh: () =>
      this.post<ApiResponse<{ token: string }>>('/auth/refresh'),
    
    forgotPassword: (email: string) =>
      this.post<ApiResponse<null>>('/auth/forgot-password', { email }),
  }

  // === COMPANIES ===
  companies = {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      this.get<ApiListResponse<any>>('/companies', params),
    
    get: (id: number) =>
      this.get<ApiResponse<any>>(`/companies/${id}`),
    
    create: (data: any) =>
      this.post<ApiResponse<any>>('/companies', data),
    
    update: (id: number, data: any) =>
      this.put<ApiResponse<any>>(`/companies/${id}`, data),
    
    delete: (id: number) =>
      this.delete<ApiResponse<null>>(`/companies/${id}`),
  }

  // === CUSTOMERS ===
  customers = {
    list: (params?: { 
      page?: number
      limit?: number
      search?: string
      company_id?: number
      status?: string
    }) =>
      this.get<ApiListResponse<any>>('/customers', params),
    
    get: (id: number) =>
      this.get<ApiResponse<any>>(`/customers/${id}`),
    
    create: (data: any) =>
      this.post<ApiResponse<any>>('/customers', data),
    
    update: (id: number, data: any) =>
      this.put<ApiResponse<any>>(`/customers/${id}`, data),
    
    delete: (id: number) =>
      this.delete<ApiResponse<null>>(`/customers/${id}`),
  }

  // === CUSTOMER ADDRESSES ===
  customerAddresses = {
    list: (params?: { 
      page?: number
      limit?: number
      customer_id?: number
      type?: string
      is_default?: boolean
    }) =>
      this.get<ApiListResponse<any>>('/customer-addresses', params),
    
    get: (id: number) =>
      this.get<ApiResponse<any>>(`/customer-addresses/${id}`),
    
    create: (data: any) =>
      this.post<ApiResponse<any>>('/customer-addresses', data),
    
    update: (id: number, data: any) =>
      this.put<ApiResponse<any>>(`/customer-addresses/${id}`, data),
    
    delete: (id: number) =>
      this.delete<ApiResponse<null>>(`/customer-addresses/${id}`),
    
    setDefault: (id: number, customer_id: number) =>
      this.put<ApiResponse<any>>(`/customer-addresses/${id}/set-default`, { customer_id }),
  }
}

// Instância única do cliente API
export const api = new ApiClient()
export default api