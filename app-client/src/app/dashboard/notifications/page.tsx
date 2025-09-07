'use client'

import { useEffect, useState } from 'react'
import { useNotificationStore } from '@/store/notification'
import { useAuthStore } from '@/store/auth'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
import { Plus, Search, Bell, BellRing, CheckCheck, Archive } from 'lucide-react'
import { Notification, CreateNotificationData, UpdateNotificationData } from '@/types'

export default function NotificationsPage() {
  const { 
    notifications, 
    selectedNotification,
    loading, 
    filters, 
    pagination,
    fetchNotifications, 
    createNotification, 
    updateNotification, 
    deleteNotification,
    markAsRead,
    markAllAsRead,
    setSelectedNotification,
    setFilters 
  } = useNotificationStore()
  
  const { user } = useAuthStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'read' | 'unread' | 'all'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, page: 1 }
    if (query) {
      newFilters.title = query
    } else {
      delete newFilters.title
    }
    setFilters(newFilters)
    fetchNotifications(newFilters)
  }

  const handleStatusFilter = (status: 'read' | 'unread' | 'all') => {
    setStatusFilter(status)
    const newFilters = { ...filters, page: 1 }
    if (status !== 'all') {
      newFilters.is_read = status === 'read'
    } else {
      delete newFilters.is_read
    }
    setFilters(newFilters)
    fetchNotifications(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchNotifications(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchNotifications(newFilters)
  }

  const openCreateModal = () => {
    setEditingNotification(null)
    setIsModalOpen(true)
  }

  const openEditModal = (notification: Notification) => {
    setEditingNotification(notification)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingNotification(null)
  }

  const handleSubmit = async (data: CreateNotificationData | UpdateNotificationData) => {
    try {
      if (editingNotification) {
        await updateNotification(editingNotification.id, data as UpdateNotificationData)
      } else {
        await createNotification(data as CreateNotificationData)
      }
      closeModal()
      fetchNotifications(filters)
    } catch (error) {
      console.error('Erro ao salvar notificação:', error)
      throw error
    }
  }

  const handleDelete = async (notification: Notification) => {
    if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
      try {
        await deleteNotification(notification.id)
        fetchNotifications(filters)
      } catch (error) {
        console.error('Erro ao excluir notificação:', error)
      }
    }
  }

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification)
  }

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id)
        fetchNotifications(filters)
      } catch (error) {
        console.error('Erro ao marcar como lida:', error)
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    if (user && window.confirm('Marcar todas as notificações como lidas?')) {
      try {
        await markAllAsRead(user.id)
        fetchNotifications(filters)
      } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error)
      }
    }
  }

  const getStatusColor = (is_read: boolean) => {
    return is_read 
      ? 'bg-gray-100 text-gray-800'
      : 'bg-blue-100 text-blue-800'
  }

  const getStatusIcon = (is_read: boolean) => {
    return is_read ? BellRing : Bell
  }

  const getTypeColor = (type: 'system' | 'alert' | 'info') => {
    const colors = {
      'info': 'bg-blue-100 text-blue-800',
      'alert': 'bg-red-100 text-red-800',
      'system': 'bg-purple-100 text-purple-800'
    }
    
    return colors[type]
  }

  const columns = [
    {
      key: 'title' as keyof Notification,
      title: 'Título',
      sortable: true,
      render: (notification: Notification) => {
        const StatusIcon = getStatusIcon(notification.is_read)
        return (
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${
              !notification.is_read ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div>
              <div className={`font-medium ${
                !notification.is_read ? 'font-semibold' : ''
              }`}>
                {notification.title}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'message' as keyof Notification,
      title: 'Mensagem',
      sortable: false,
      render: (notification: Notification) => (
        <div className="max-w-sm truncate" title={notification.message}>
          {notification.message.length > 50 
            ? notification.message.substring(0, 50) + '...' 
            : notification.message}
        </div>
      )
    },
    {
      key: 'type' as keyof Notification,
      title: 'Tipo',
      sortable: true,
      render: (notification: Notification) => (
        <Badge className={getTypeColor(notification.type)}>
          {notification.type}
        </Badge>
      )
    },
    {
      key: 'is_read' as keyof Notification,
      title: 'Status',
      sortable: true,
      render: (notification: Notification) => (
        <Badge className={getStatusColor(notification.is_read)}>
          {notification.is_read ? 'Lida' : 'Não lida'}
        </Badge>
      )
    },
    {
      key: 'created_at' as keyof Notification,
      title: 'Criado em',
      sortable: true,
      render: (notification: Notification) => 
        new Date(notification.created_at).toLocaleDateString('pt-BR')
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
      name: 'title',
      label: 'Título',
      type: 'text' as const,
      required: true,
      placeholder: 'Título da notificação'
    },
    {
      name: 'message',
      label: 'Mensagem',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Mensagem da notificação...',
      rows: 4
    },
    {
      name: 'type',
      label: 'Tipo',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'info', label: 'Informação' },
        { value: 'alert', label: 'Alerta' },
        { value: 'system', label: 'Sistema' }
      ]
    },
    {
      name: 'is_read',
      label: 'Status',
      type: 'select' as const,
      required: false,
      options: [
        { value: false, label: 'Não lida' },
        { value: true, label: 'Lida' }
      ]
    }
  ]

  const defaultValues = editingNotification || {
    user_id: user?.id || 1,
    title: '',
    message: '',
    type: 'info' as const,
    is_read: false
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const readCount = notifications.filter(n => n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notificações</h2>
          <p className="text-muted-foreground">
            Gerencie notificações do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar Todas como Lidas
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Notificação
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              notificações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              precisam atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lidas</CardTitle>
            <BellRing className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readCount}</div>
            <p className="text-xs text-muted-foreground">
              já visualizadas
            </p>
          </CardContent>
        </Card>

      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notificações..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="unread">Não lidas</SelectItem>
            <SelectItem value="read">Lidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={notifications}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onView={handleView}
        customActions={(notification: Notification) => (
          <div className="flex gap-1">
            {!notification.is_read && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsRead(notification)}
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        title={editingNotification ? 'Editar Notificação' : 'Nova Notificação'}
        fields={formFields}
        defaultValues={defaultValues}
        loading={loading}
      />

      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {(() => {
                      const StatusIcon = getStatusIcon(selectedNotification.is_read)
                      return <StatusIcon className={`h-5 w-5 ${
                        !selectedNotification.is_read ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    })()}
                    {selectedNotification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">ID do Usuário: {selectedNotification.user_id}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedNotification(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status:</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedNotification.is_read)}>
                        {selectedNotification.is_read ? 'Lida' : 'Não lida'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo:</label>
                    <div className="mt-1">
                      <Badge className={getTypeColor(selectedNotification.type)}>
                        {selectedNotification.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Mensagem:</label>
                  <div className="mt-2 p-4 border rounded-md bg-gray-50">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Criado em:</label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedNotification.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Atualizado em:</label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedNotification.updated_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                {!selectedNotification.is_read && (
                  <div className="flex gap-2">
                    <Button onClick={() => {
                      handleMarkAsRead(selectedNotification)
                      setSelectedNotification(null)
                    }}>
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Marcar como Lida
                    </Button>
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