'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'

export interface Permission {
  name: string
  resource: string
  action: string
}

export interface UserRole {
  name: string
  permissions: Permission[]
}

interface PermissionState {
  userRoles: UserRole[]
  userPermissions: Permission[]
  isLoading: boolean
  error: string | null
}

/**
 * Hook para verificação de permissões baseado no sistema do backend
 * Implementa a mesma lógica do middleware de autorização da API
 */
export function usePermissions() {
  const { user, token } = useAuthStore()
  const [permissionState, setPermissionState] = useState<PermissionState>({
    userRoles: [],
    userPermissions: [],
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!user || !token) {
        setPermissionState({
          userRoles: [],
          userPermissions: [],
          isLoading: false,
          error: null
        })
        return
      }

      try {
        setPermissionState(prev => ({ ...prev, isLoading: true, error: null }))

        // Por enquanto, vamos usar uma implementação simplificada baseada no usuário logado
        // Em uma implementação completa, estas informações viriam da API
        
        let userRoles: UserRole[] = []
        let userPermissions: Permission[] = []
        
        // Simular roles baseado no role_id do usuário ou company_admin se tiver company_id
        if (user.role_id === 1) {
          // Assumindo role_id 1 = admin
          userRoles.push({ name: 'admin', permissions: [] })
        } else if (user.company_id) {
          // Se tem company_id, é um company_admin (manager)
          userRoles.push({ name: 'company_admin', permissions: [] })
        } else {
          // Usuário comum
          userRoles.push({ name: 'user', permissions: [] })
        }

        // Para admin, não precisa de permissões específicas
        const isAdmin = userRoles.some(role => role.name === 'admin')
        
        if (!isAdmin) {
          // Aqui você pode implementar a lógica de buscar permissões específicas
          // Por enquanto, vamos assumir que company_admin tem algumas permissões básicas
          if (userRoles.some(role => role.name === 'company_admin')) {
            userPermissions = [
              { name: 'company:read', resource: 'company', action: 'read' },
              { name: 'customer:read', resource: 'customer', action: 'read' },
              { name: 'subscription:read', resource: 'subscription', action: 'read' },
              { name: 'plan:read', resource: 'plan', action: 'read' },
              { name: 'notification:read', resource: 'notification', action: 'read' },
              { name: 'user:read', resource: 'user', action: 'read' },
              { name: 'session:read', resource: 'session', action: 'read' },
              { name: 'email_template:read', resource: 'email_template', action: 'read' },
              { name: 'payment:read', resource: 'payment', action: 'read' },
              { name: 'log:read', resource: 'log', action: 'read' }
            ]
          }
        }

        setPermissionState({
          userRoles,
          userPermissions,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Erro ao buscar permissões:', error)
        setPermissionState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erro ao carregar permissões do usuário'
        }))
      }
    }

    fetchUserPermissions()
  }, [user, token])

  /**
   * Verifica se o usuário é admin (acesso total)
   */
  const isAdmin = (): boolean => {
    return permissionState.userRoles.some(role => role.name === 'admin')
  }

  /**
   * Verifica se o usuário tem um role específico
   */
  const hasRole = (roleName: string): boolean => {
    if (isAdmin()) return true
    
    // Mapear "manager" para "company_admin" para compatibilidade
    const mappedRole = roleName === 'manager' ? 'company_admin' : roleName
    return permissionState.userRoles.some(role => role.name === mappedRole)
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const hasPermission = (permissionName: string): boolean => {
    if (isAdmin()) return true
    
    return permissionState.userPermissions.some(
      permission => permission.name === permissionName
    )
  }

  /**
   * Verifica se o usuário tem acesso a um recurso e ação específicos
   */
  const hasResourcePermission = (resource: string, action: string): boolean => {
    if (isAdmin()) return true
    
    return permissionState.userPermissions.some(
      permission => permission.resource === resource && permission.action === action
    )
  }

  /**
   * Verifica se o usuário tem qualquer um dos roles especificados
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (isAdmin()) return true
    
    return roles.some(role => hasRole(role))
  }

  /**
   * Verifica se o usuário tem qualquer uma das permissões especificadas
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (isAdmin()) return true
    
    return permissions.some(permission => hasPermission(permission))
  }

  /**
   * Implementa a lógica completa do middleware de autorização
   * Verifica roles e permissões seguindo a mesma lógica do backend
   */
  const canAccess = (requiredRoles: string[] = [], requiredPermissions: string[] = []): boolean => {
    // 1. Admin: Acesso total
    if (isAdmin()) {
      return true
    }

    // 2. Verificar se tem algum role necessário
    const hasRequiredRole = requiredRoles.length === 0 || hasAnyRole(requiredRoles)

    // 3. Para managers (company_admin), verificar permissões específicas
    const isManager = hasRole('company_admin')
    
    if (isManager) {
      // Manager deve ter permissões específicas para a ação
      if (requiredPermissions.length > 0) {
        const hasSpecificPermission = hasAnyPermission(requiredPermissions)
        if (!hasSpecificPermission) {
          return false
        }
      }
      
      // Manager tem o role necessário?
      if (!hasRequiredRole) {
        return false
      }
      
      return true
    }

    // 4. Para usuários comuns, verificar role OU permissão
    const hasRequiredPermission = requiredPermissions.length === 0 || hasAnyPermission(requiredPermissions)

    return hasRequiredRole && hasRequiredPermission
  }

  return {
    ...permissionState,
    isAdmin,
    hasRole,
    hasPermission,
    hasResourcePermission,
    hasAnyRole,
    hasAnyPermission,
    canAccess
  }
}