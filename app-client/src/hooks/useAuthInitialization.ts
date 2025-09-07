import { useAuthStore } from '@/store/auth'

export const useAuthInitialization = () => {
  const { isAuthenticated, token, user, isLoading } = useAuthStore()
  
  // Considera inicializado quando não está mais carregando
  const isInitialized = !isLoading

  return {
    isInitialized,
    isAuthenticated: isInitialized ? isAuthenticated : false,
    user: isInitialized ? user : null,
    token: isInitialized ? token : null,
    isLoading,
  }
}