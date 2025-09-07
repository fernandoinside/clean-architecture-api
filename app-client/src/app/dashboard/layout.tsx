'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useAuthInitialization } from '@/hooks/useAuthInitialization'
import { useMenuPermissions } from '@/components/navigation/ConditionalMenu'
import { ConditionalMenu } from '@/components/navigation/ConditionalMenu'
import { getMenuPermissions, shouldShowSection } from '@/config/menuPermissions'
import { FilteredDataProvider } from '@/components/data/FilteredDataProvider'
import { NotificationsBell } from '@/components/notifications/NotificationsBell'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Shield,
  UserCheck,
  ScrollText,
  ShieldCheck,
  UserPlus,
  Settings,
  LogOut, 
  Menu,
  X,
  Loader2,
  Mail,
  FileText,
  Bell,
  CreditCard,
  Crown,
  Monitor,
  UserCog,
  Package,
  ChevronDown,
  HelpCircle
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  menuKey?: string
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuthStore()
  const { isInitialized, isAuthenticated, user } = useAuthInitialization()
  const { canAccessMenu, isLoading: permissionsLoading } = useMenuPermissions()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Só redireciona após a inicialização estar completa
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isInitialized, isAuthenticated, router])

  // Nota: retornos condicionais movidos para DEPOIS dos hooks para manter a ordem estável

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navigationSections = [
    {
      title: 'Cadastros',
      items: [
        { name: 'Empresas', href: '/dashboard/companies', icon: Building2, description: 'Gerencie empresas cadastradas', menuKey: 'companies' },
        { name: 'Clientes', href: '/dashboard/customers', icon: Users, description: 'Gerencie clientes e endereços', menuKey: 'customers' },
        { name: 'Arquivos', href: '/dashboard/files', icon: FileText, description: 'Gerencie arquivos e uploads', menuKey: 'files' }
      ]
    },
    {
      title: 'Usuários & Acesso',
      items: [
        { name: 'Usuários', href: '/dashboard/users', icon: UserCog, description: 'Gerencie usuários do sistema', menuKey: 'users' },
        { name: 'Papéis', href: '/dashboard/roles', icon: UserCheck, description: 'Gerencie papéis de usuário', menuKey: 'roles' },
        { name: 'Permissões', href: '/dashboard/permissions', icon: Shield, description: 'Controle de acesso e permissões', menuKey: 'permissions' },
        { name: 'Papel-Permissão', href: '/dashboard/role-permissions', icon: ShieldCheck, description: 'Associações papel-permissão', menuKey: 'role-permissions' },
        { name: 'Usuário-Papel', href: '/dashboard/user-roles', icon: UserPlus, description: 'Atribuições de usuários', menuKey: 'user-roles' },
        { name: 'Sessões', href: '/dashboard/sessions', icon: Monitor, description: 'Gerencie sessões de usuários', menuKey: 'sessions' }
      ]
    },
    {
      title: 'Assinaturas',
      items: [
        { name: 'Planos', href: '/dashboard/plans', icon: Crown, description: 'Gerencie planos de assinatura', menuKey: 'plans' },
        { name: 'Assinaturas', href: '/dashboard/subscriptions', icon: Package, description: 'Gerencie assinaturas de empresas', menuKey: 'subscriptions' },
        { name: 'Pagamentos', href: '/dashboard/payments', icon: CreditCard, description: 'Gerencie pagamentos e transações', menuKey: 'payments' }
      ]
    },
    {
      title: 'Comunicação',
      items: [
        { name: 'Templates E-mail', href: '/dashboard/email-templates', icon: Mail, description: 'Templates de e-mail personalizados', menuKey: 'email-templates' },
        { name: 'Notificações', href: '/dashboard/notifications', icon: Bell, description: 'Gerencie notificações do sistema', menuKey: 'notifications' },
        { name: 'Páginas Estáticas', href: '/dashboard/page-statics', icon: FileText, description: 'Gerencie conteúdo estático do site', menuKey: 'page-statics' },
        { name: 'Tickets', href: '/dashboard/tickets', icon: HelpCircle, description: 'Sistema de tickets de suporte e contato', menuKey: 'tickets' }
      ]
    },
    {
      title: 'Observabilidade',
      items: [
        { name: 'Logs', href: '/dashboard/logs', icon: ScrollText, description: 'Registros e auditoria do sistema', menuKey: 'logs' }
      ]
    },
    {
      title: 'Configurações',
      items: [
        { name: 'Configurações', href: '/dashboard/settings', icon: Settings, description: 'Configurações do sistema (key-value)', menuKey: 'settings' },
        { name: 'Perfil', href: '/dashboard/profile', icon: UserCog, description: 'Configurações da conta', menuKey: 'profile' }
      ]
    }
  ]

  // Initialize expanded sections from localStorage or default to expanded
  useEffect(() => {
    setExpandedSections((prev) => {
      if (Object.keys(prev).length > 0) return prev
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('sidebar:sections') : null
        if (saved) {
          return JSON.parse(saved)
        }
      } catch {}
      const defaults: Record<string, boolean> = {}
      navigationSections.forEach((s) => { defaults[s.title] = true })
      return defaults
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist expanded state
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar:sections', JSON.stringify(expandedSections))
      }
    } catch {}
  }, [expandedSections])

  const toggleSection = (title: string) => {
    setExpandedSections((s) => ({ ...s, [title]: !s[title] }))
  }

  // Aguarda a inicialização completa (após hooks para manter ordem)
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Inicializando aplicação...</p>
      </div>
    )
  }

  // Se não estiver autenticado após a inicialização
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Redirecionando para login...</p>
      </div>
    )
  }

  return (
    <FilteredDataProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out 
          lg:relative lg:translate-x-0 lg:inset-0 lg:w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Menu de navegação"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">SRM Gestão</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-4">
              {navigationSections.map((section) => {
                const isOpen = expandedSections[section.title] !== false
                
                // Verificar se a seção deve ser exibida baseada nas permissões
                if (!shouldShowSection(section.title, canAccessMenu)) {
                  return null
                }
                
                // Filtrar itens baseado nas permissões
                const visibleItems = section.items.filter(item => {
                  const config = getMenuPermissions(item.menuKey || '')
                  if (!config) return true
                  return canAccessMenu(config.roles, config.permissions)
                })
                
                // Se não há itens visíveis, não mostra a seção
                if (visibleItems.length === 0) {
                  return null
                }
                
                return (
                  <div key={section.title}>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-wider text-gray-500 uppercase hover:text-gray-700"
                      aria-expanded={isOpen}
                      aria-controls={`section-${section.title}`}
                    >
                      <span>{section.title}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div id={`section-${section.title}`} className="space-y-1 mt-1">
                        {visibleItems.map((item) => {
                          const config = getMenuPermissions(item.menuKey || '')
                          
                          return (
                            <ConditionalMenu
                              key={item.name}
                              roles={config?.roles}
                              permissions={config?.permissions}
                              showLoading={permissionsLoading}
                            >
                              <Link
                                href={item.href}
                                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 group transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => setSidebarOpen(false)}
                                aria-label={item.name}
                              >
                                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" aria-hidden="true" />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-gray-400">{item.description}</div>
                                </div>
                              </Link>
                            </ConditionalMenu>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="mt-auto p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              Logado como: <span className="font-medium">{user.name || user.first_name || user.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
              aria-label="Sair da conta"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 lg:hidden mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Alternar menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Painel de Controle
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={user.company?.name || 'Sem empresa'}>
                  {user.company?.name || 'Sem empresa'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-xs" title={user.email}>
                  {user.email}
                </p>
              </div>
              
              {/* Notificações */}
              <NotificationsBell />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-700 hover:bg-gray-50 border-gray-200 hidden sm:flex"
                aria-label="Sair da conta"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </FilteredDataProvider>
  )
}