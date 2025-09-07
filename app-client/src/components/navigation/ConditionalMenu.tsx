'use client'

import { usePermissions } from '@/hooks/usePermissions'

interface ConditionalMenuProps {
  children: React.ReactNode
  roles?: string[]
  permissions?: string[]
  showLoading?: boolean
}

/**
 * Hook para verificação de permissões de menu
 */
export function useMenuPermissions() {
  const { canAccess, isLoading } = usePermissions()

  const canAccessMenu = (roles: string[] = [], permissions: string[] = []): boolean => {
    return canAccess(roles, permissions)
  }

  return {
    canAccessMenu,
    isLoading
  }
}

/**
 * Componente que renderiza conditionally baseado em roles e permissões
 */
export function ConditionalMenu({ 
  children, 
  roles = [], 
  permissions = [], 
  showLoading = false 
}: ConditionalMenuProps) {
  const { canAccessMenu, isLoading } = useMenuPermissions()

  // Se está carregando e showLoading é true, não mostra nada
  if (isLoading && showLoading) {
    return null
  }

  // Se não tem acesso, não renderiza
  if (!canAccessMenu(roles, permissions)) {
    return null
  }

  return <>{children}</>
}