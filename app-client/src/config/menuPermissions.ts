/**
 * Configurações de permissões para itens de menu
 * Define quais roles e permissões são necessários para acessar cada menu
 */

interface MenuPermissionConfig {
  roles?: string[]
  permissions?: string[]
}

/**
 * Configuração de permissões por menu
 */
const menuPermissions: Record<string, MenuPermissionConfig> = {
  // Cadastros
  companies: {
    roles: ['admin', 'company_admin'],
    permissions: ['company:read']
  },
  customers: {
    roles: ['admin', 'company_admin'],
    permissions: ['customer:read']
  },
  files: {
    roles: ['admin', 'company_admin'],
    permissions: ['file:read']
  },

  // Usuários & Acesso
  users: {
    roles: ['admin'],
    permissions: ['user:read']
  },
  roles: {
    roles: ['admin'],
    permissions: ['role:read']
  },
  permissions: {
    roles: ['admin'],
    permissions: ['permission:read']
  },
  'role-permissions': {
    roles: ['admin'],
    permissions: ['role_permission:read']
  },
  'user-roles': {
    roles: ['admin'],
    permissions: ['user_role:read']
  },
  sessions: {
    roles: ['admin', 'company_admin'],
    permissions: ['session:read']
  },

  // Assinaturas
  plans: {
    roles: ['admin', 'company_admin'],
    permissions: ['plan:read']
  },
  subscriptions: {
    roles: ['admin', 'company_admin'],
    permissions: ['subscription:read']
  },
  payments: {
    roles: ['admin', 'company_admin'],
    permissions: ['payment:read']
  },

  // Comunicação
  'email-templates': {
    roles: ['admin', 'company_admin'],
    permissions: ['email_template:read']
  },
  notifications: {
    roles: ['admin', 'company_admin'],
    permissions: ['notification:read']
  },
  'page-statics': {
    roles: ['admin', 'manager'],
    permissions: ['admin', 'manager']
  },

  // Observabilidade
  logs: {
    roles: ['admin'],
    permissions: ['log:read']
  },

  // Configurações
  settings: {
    roles: ['admin'],
    permissions: ['setting:read']
  },
  profile: {
    roles: ['admin', 'company_admin', 'user'],
    permissions: []
  }
}

/**
 * Configuração de quais seções devem ser exibidas baseado nos menus visíveis
 */
const sectionVisibilityConfig: Record<string, string[]> = {
  'Cadastros': ['companies', 'customers', 'files'],
  'Usuários & Acesso': ['users', 'roles', 'permissions', 'role-permissions', 'user-roles', 'sessions'],
  'Assinaturas': ['plans', 'subscriptions', 'payments'],
  'Comunicação': ['email-templates', 'notifications', 'page-statics'],
  'Observabilidade': ['logs'],
  'Configurações': ['settings', 'profile']
}

/**
 * Obtém a configuração de permissões para um menu específico
 */
export function getMenuPermissions(menuKey: string): MenuPermissionConfig | null {
  return menuPermissions[menuKey] || null
}

/**
 * Verifica se uma seção deve ser exibida baseado nas permissões dos menus
 */
export function shouldShowSection(
  sectionTitle: string, 
  canAccessMenu: (roles: string[], permissions: string[]) => boolean
): boolean {
  const menuKeys = sectionVisibilityConfig[sectionTitle]
  
  if (!menuKeys) {
    return true // Se não há configuração, mostra a seção
  }

  // Verifica se pelo menos um menu da seção está acessível
  return menuKeys.some(menuKey => {
    const config = getMenuPermissions(menuKey)
    if (!config) return true
    
    return canAccessMenu(config.roles || [], config.permissions || [])
  })
}

/**
 * Lista todos os menus configurados
 */
export function getAllMenuKeys(): string[] {
  return Object.keys(menuPermissions)
}

/**
 * Lista todas as seções configuradas
 */
export function getAllSectionTitles(): string[] {
  return Object.keys(sectionVisibilityConfig)
}