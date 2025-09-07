'use client'

import { useEffect, useState } from 'react'
import { useSessionStore } from '@/store/session'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
import { Plus, Search, Monitor, Users, Clock, Shield, LogOut, AlertTriangle, MoreVertical } from 'lucide-react'
import { Session, CreateSessionData, UpdateSessionData } from '@/types'

export default function SessionsPage() {
  const { 
    sessions, 
    selectedSession,
    loading, 
    filters, 
    pagination,
    fetchSessions, 
    createSession, 
    updateSession, 
    deleteSession,
    setSelectedSession,
    setFilters 
  } = useSessionStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, page: 1 }
    if (query) {
      newFilters.ip_address = query
    } else {
      delete newFilters.ip_address
    }
    setFilters(newFilters)
    fetchSessions(newFilters)
  }

  const handleActiveFilter = (active: 'all' | 'active' | 'inactive') => {
    setActiveFilter(active)
    const newFilters = { ...filters, page: 1 }
    if (active !== 'all') {
      newFilters.is_active = active === 'active'
    } else {
      delete newFilters.is_active
    }
    setFilters(newFilters)
    fetchSessions(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchSessions(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchSessions(newFilters)
  }

  const openCreateModal = () => {
    setEditingSession(null)
    setIsModalOpen(true)
  }

  const openEditModal = (session: Session) => {
    setEditingSession(session)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSession(null)
  }

  const handleSubmit = async (data: CreateSessionData | UpdateSessionData) => {
    try {
      if (editingSession) {
        await updateSession(editingSession.id, data as UpdateSessionData)
      } else {
        await createSession(data as CreateSessionData)
      }
      closeModal()
      fetchSessions(filters)
    } catch (error) {
      console.error('Erro ao salvar sessão:', error)
      throw error
    }
  }

  const handleDelete = async (session: Session) => {
    if (window.confirm('Tem certeza que deseja excluir esta sessão?')) {
      try {
        await deleteSession(session.id)
        fetchSessions(filters)
      } catch (error) {
        console.error('Erro ao excluir sessão:', error)
      }
    }
  }

  const handleView = (session: Session) => {
    setSelectedSession(session)
  }

  const handleRevokeSession = async (session: Session) => {
    if (window.confirm('Tem certeza que deseja revogar esta sessão?')) {
      try {
        await updateSession(session.id, { is_active: false })
        fetchSessions(filters)
      } catch (error) {
        console.error('Erro ao revogar sessão:', error)
      }
    }
  }

  const handleLogoutAll = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja desconectar todas as sessões deste usuário?')) {
      try {
        // Call logout-all endpoint
        const response = await fetch('/api/auth/logout-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ user_id: userId })
        })
        
        if (response.ok) {
          await fetchSessions(filters)
        } else {
          throw new Error('Falha ao desconectar todas as sessões')
        }
      } catch (error) {
        console.error('Erro ao desconectar todas as sessões:', error)
      }
    }
  }

  const isInactive = (lastActivity: string) => {
    const now = new Date()
    const lastActiveTime = new Date(lastActivity)
    const diffHours = (now.getTime() - lastActiveTime.getTime()) / (1000 * 60 * 60)
    return diffHours > 24 // Consider inactive if no activity for more than 24 hours
  }

  const formatLastActivity = (lastActivity: string) => {
    const now = new Date()
    const lastActiveTime = new Date(lastActivity)
    const diff = now.getTime() - lastActiveTime.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d atrás`
    if (hours > 0) return `${hours}h atrás`
    if (minutes > 0) return `${minutes}min atrás`
    return 'Agora mesmo'
  }

  const getBrowserFromUserAgent = (userAgent?: string | null) => {
    if (!userAgent) return 'Desconhecido'
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Desconhecido'
  }

  const getOSFromUserAgent = (userAgent?: string | null) => {
    if (!userAgent) return 'Desconhecido'
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Desconhecido'
  }

  const columns = [
    {
      key: 'user_id' as keyof Session,
      title: 'Usuário',
      sortable: true,
      render: (session: Session) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">ID: {session.user_id}</span>
        </div>
      )
    },
    {
      key: 'ip_address' as keyof Session,
      title: 'IP Address',
      sortable: true,
      render: (session: Session) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
          {session.ip_address || 'N/A'}
        </code>
      )
    },
    {
      key: 'user_agent' as keyof Session,
      title: 'Dispositivo',
      sortable: false,
      render: (session: Session) => (
        <div className="text-sm">
          <div className="font-medium">{getBrowserFromUserAgent(session.user_agent)}</div>
          <div className="text-muted-foreground">{getOSFromUserAgent(session.user_agent)}</div>
        </div>
      )
    },
    {
      key: 'last_activity' as keyof Session,
      title: 'Última Atividade',
      sortable: true,
      render: (session: Session) => {
        const inactive = isInactive(session.last_activity)
        return (
          <div className="text-sm">
            <div className={inactive ? 'text-red-600' : 'text-green-600'}>
              {formatLastActivity(session.last_activity)}
            </div>
            <div className="text-muted-foreground">
              {new Date(session.last_activity).toLocaleDateString('pt-BR')}
            </div>
          </div>
        )
      }
    },
    {
      key: 'is_active' as keyof Session,
      title: 'Status',
      sortable: true,
      render: (session: Session) => {
        const inactive = isInactive(session.last_activity)
        let status = 'inactive'
        let label = 'Inativa'
        
        if (session.is_active && !inactive) {
          status = 'active'
          label = 'Ativa'
        } else if (inactive) {
          status = 'stale'
          label = 'Expirada'
        }
        
        const colors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          stale: 'bg-red-100 text-red-800'
        } as Record<string, string>
        
        return (
          <Badge className={colors[status]}>
            {label}
          </Badge>
        )
      }
    },
    {
      key: 'created_at' as keyof Session,
      title: 'Criada em',
      sortable: true,
      render: (session: Session) => 
        new Date(session.created_at).toLocaleDateString('pt-BR')
    }
  ]

  const formFields = [
    {
      name: 'user_id',
      label: 'ID do Usuário',
      type: 'number' as const,
      required: true,
      placeholder: 'ID do usuário'
    },
    {
      name: 'token',
      label: 'Token',
      type: 'textarea' as const,
      required: true,
      placeholder: 'JWT token...',
      rows: 3
    },
    {
      name: 'ip_address',
      label: 'Endereço IP',
      type: 'text' as const,
      required: false,
      placeholder: '192.168.1.100'
    },
    {
      name: 'user_agent',
      label: 'User Agent',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Mozilla/5.0...',
      rows: 2
    },
    {
      name: 'last_activity',
      label: 'Última Atividade',
      type: 'datetime-local' as const,
      required: true
    },
    {
      name: 'is_active',
      label: 'Ativa',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'true', label: 'Sim' },
        { value: 'false', label: 'Não' }
      ]
    }
  ]

  const defaultValues = editingSession ? {
    ...editingSession,
    last_activity: new Date(editingSession.last_activity).toISOString().slice(0, 16),
    is_active: editingSession.is_active.toString()
  } : {
    user_id: 1,
    token: '',
    ip_address: '',
    user_agent: '',
    last_activity: new Date().toISOString().slice(0, 16),
    is_active: 'true'
  }

  // Calcular estatísticas
  const activeSessions = sessions.filter(s => s.is_active && !isInactive(s.last_activity)).length
  const staleSessions = sessions.filter(s => isInactive(s.last_activity)).length
  const inactiveSessions = sessions.filter(s => !s.is_active).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessões</h2>
          <p className="text-muted-foreground">
            Gerencie sessões de usuários e tokens de autenticação
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Sessão
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              sessões registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              usuários logados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{staleSessions}</div>
            <p className="text-xs text-muted-foreground">
              sem atividade recente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revogadas</CardTitle>
            <Monitor className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveSessions}</div>
            <p className="text-xs text-muted-foreground">
              desconectadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por IP address..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={activeFilter} onValueChange={handleActiveFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as sessões</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => fetchSessions(filters)}
            title="Atualizar dados"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DataTable
        data={sessions}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onView={handleView}
        customActions={(session: Session) => (
          <div className="flex gap-1">
            {session.is_active && !isInactive(session.last_activity) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(session)}
                  title="Revogar sessão"
                >
                  <Shield className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleLogoutAll(session.user_id)}
                  title="Desconectar todas as sessões do usuário"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        title={editingSession ? 'Editar Sessão' : 'Nova Sessão'}
        fields={formFields}
        defaultValues={defaultValues}
        loading={loading}
      />

      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Sessão #{selectedSession.id}
                  </h3>
                  <p className="text-sm text-muted-foreground">Usuário: {selectedSession.user_id}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSession(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">Status:</label>
                    <div className="mt-1">
                      {(() => {
                        const inactive = isInactive(selectedSession.last_activity)
                        let status = 'inactive'
                        let label = 'Inativa'
                        
                        if (selectedSession.is_active && !inactive) {
                          status = 'active'
                          label = 'Ativa'
                        } else if (inactive) {
                          status = 'stale'
                          label = 'Inativa'
                        }
                        
                        const colors = {
                          active: 'bg-green-100 text-green-800',
                          inactive: 'bg-gray-100 text-gray-800',
                          stale: 'bg-red-100 text-red-800'
                        } as Record<string, string>
                        
                        return (
                          <Badge className={colors[status]}>
                            {label}
                          </Badge>
                        )
                      })()
                      }
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-600">Última Atividade:</label>
                    <div className="mt-1 text-sm">{formatLastActivity(selectedSession.last_activity)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Endereço IP:</label>
                    <div className="mt-1">
                      <code className="px-2 py-1 bg-white border rounded text-sm">
                        {selectedSession.ip_address || 'N/A'}
                      </code>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Dispositivo:</label>
                    <div className="mt-1">
                      <div className="text-sm font-medium">{getBrowserFromUserAgent(selectedSession.user_agent)}</div>
                      <div className="text-sm text-gray-500">{getOSFromUserAgent(selectedSession.user_agent)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-600">User Agent:</label>
                  <div className="mt-2 p-3 bg-white border rounded-md text-sm font-mono break-all">
                    {selectedSession.user_agent || 'N/A'}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-600">Token (primeiros 50 caracteres):</label>
                  <div className="mt-2 p-3 bg-white border rounded-md text-sm font-mono break-all">
                    {selectedSession.token.substring(0, 50)}...
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Última Atividade:</label>
                    <div className="mt-1 text-sm">{new Date(selectedSession.last_activity).toLocaleString('pt-BR')}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Criada em:</label>
                    <div className="mt-1 text-sm">{new Date(selectedSession.created_at).toLocaleString('pt-BR')}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Atualizada em:</label>
                    <div className="mt-1 text-sm">{new Date(selectedSession.updated_at).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
                
                {selectedSession.is_active && !isInactive(selectedSession.last_activity) && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleRevokeSession(selectedSession)
                        setSelectedSession(null)
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Revogar Esta Sessão
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleLogoutAll(selectedSession.user_id)
                        setSelectedSession(null)
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Desconectar Todas as Sessões
                    </Button>
                  </div>
                )}
                
                {(!selectedSession.is_active || isInactive(selectedSession.last_activity)) && (
                  <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div className="text-sm text-yellow-700">
                      {isInactive(selectedSession.last_activity) 
                        ? 'Esta sessão não tem atividade recente e pode estar inativa.'
                        : 'Esta sessão foi desativada ou revogada.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}