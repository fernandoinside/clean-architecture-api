'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTicketStore, Ticket, CreateTicketData, UpdateTicketData } from '@/store/ticket'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
import { 
  Plus, 
  Search, 
  Ticket as TicketIcon, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react'

export default function TicketsPage() {
  const { 
    tickets, 
    selectedTicket,
    loading, 
    filters, 
    pagination,
    fetchTickets, 
    createTicket, 
    updateTicket, 
    deleteTicket,
    assignTicket,
    changeStatus,
    setSelectedTicket,
    setFilters 
  } = useTicketStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchTickets()
  }, [filters, pagination.page])

  const handleCreate = () => {
    setSelectedTicket(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = async (ticket: Ticket) => {
    if (window.confirm(`Tem certeza que deseja remover o ticket "${ticket.title}"?`)) {
      await deleteTicket(ticket.id)
    }
  }

  const handleStatusChange = async (ticket: Ticket, status: Ticket['status']) => {
    await changeStatus(ticket.id, status)
  }

  const handleAssign = async (ticket: Ticket, userId: number) => {
    await assignTicket(ticket.id, userId)
  }

  const handleSubmit = async (data: CreateTicketData | UpdateTicketData) => {
    try {
      if (modalMode === 'create') {
        await createTicket(data as CreateTicketData)
      } else if (modalMode === 'edit') {
        await updateTicket(selectedTicket!.id, data)
      }
      setIsModalOpen(false)
    } catch (error) {
      // Error is handled in store
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto'
      case 'in_progress': return 'Em Andamento'
      case 'pending': return 'Pendente'
      case 'resolved': return 'Resolvido'
      case 'closed': return 'Fechado'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa'
      case 'medium': return 'Média'
      case 'high': return 'Alta'
      case 'urgent': return 'Urgente'
      default: return priority
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'support': return 'Suporte'
      case 'contact': return 'Contato'
      case 'technical': return 'Técnico'
      case 'billing': return 'Cobrança'
      case 'feature_request': return 'Nova Funcionalidade'
      case 'bug_report': return 'Relatório de Bug'
      default: return category
    }
  }

  const columns = [
    {
      key: 'id' as keyof Ticket,
      title: 'ID',
      sortable: true
    },
    {
      key: 'title' as keyof Ticket,
      title: 'Título',
      sortable: true
    },
    {
      key: 'status' as keyof Ticket,
      title: 'Status',
      sortable: true,
      render: (ticket: Ticket) => (
        <Badge className={getStatusColor(ticket.status)}>
          {getStatusLabel(ticket.status)}
        </Badge>
      )
    },
    {
      key: 'priority' as keyof Ticket,
      title: 'Prioridade',
      sortable: true,
      render: (ticket: Ticket) => (
        <Badge className={getPriorityColor(ticket.priority)}>
          {getPriorityLabel(ticket.priority)}
        </Badge>
      )
    },
    {
      key: 'category' as keyof Ticket,
      title: 'Categoria',
      sortable: true,
      render: (ticket: Ticket) => getCategoryLabel(ticket.category)
    },
    {
      key: 'user' as keyof Ticket,
      title: 'Usuário',
      sortable: false,
      render: (ticket: Ticket) => ticket.user?.name || 'N/A'
    },
    {
      key: 'assigned_user' as keyof Ticket,
      title: 'Atribuído para',
      sortable: false,
      render: (ticket: Ticket) => ticket.assigned_user?.name || 'Não atribuído'
    },
    {
      key: 'created_at' as keyof Ticket,
      title: 'Criado em',
      sortable: true,
      render: (ticket: Ticket) => new Date(ticket.created_at).toLocaleString('pt-BR')
    },
    {
      key: 'actions',
      title: 'Ações',
      sortable: false,
      render: (ticket: Ticket) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(ticket)}
            aria-label="Editar ticket"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Select
            value={ticket.status}
            onValueChange={(status: Ticket['status']) => handleStatusChange(ticket, status)}
          >
            <SelectTrigger className="w-auto h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(ticket)}
            className="text-red-600 hover:text-red-800"
            aria-label="Excluir ticket"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create': return 'Novo Ticket'
      case 'edit': return 'Editar Ticket'
      default: return 'Ticket'
    }
  }

  const formFields = useMemo(() => [
    {
      name: 'title',
      label: 'Título',
      type: 'text' as const,
      required: true,
      placeholder: 'Descreva brevemente o problema ou solicitação'
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Descreva detalhadamente o problema ou solicitação',
      rows: 6
    },
    {
      name: 'category',
      label: 'Categoria',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'support', label: 'Suporte' },
        { value: 'contact', label: 'Contato' },
        { value: 'technical', label: 'Técnico' },
        { value: 'billing', label: 'Cobrança' },
        { value: 'feature_request', label: 'Nova Funcionalidade' },
        { value: 'bug_report', label: 'Relatório de Bug' }
      ]
    },
    {
      name: 'priority',
      label: 'Prioridade',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'low', label: 'Baixa' },
        { value: 'medium', label: 'Média' },
        { value: 'high', label: 'Alta' },
        { value: 'urgent', label: 'Urgente' }
      ]
    }
  ], [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tickets de Suporte</h1>
          <p className="text-gray-600">Gerencie solicitações de suporte e contato</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TicketIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Abertos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fechados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === 'closed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Buscar por título ou descrição..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ search: e.target.value || undefined })}
              />
            </div>
            <div>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => setFilters({ status: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select 
                value={filters.priority || 'all'} 
                onValueChange={(value) => setFilters({ priority: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select 
                value={filters.category || 'all'} 
                onValueChange={(value) => setFilters({ category: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="support">Suporte</SelectItem>
                  <SelectItem value="contact">Contato</SelectItem>
                  <SelectItem value="technical">Técnico</SelectItem>
                  <SelectItem value="billing">Cobrança</SelectItem>
                  <SelectItem value="feature_request">Nova Funcionalidade</SelectItem>
                  <SelectItem value="bug_report">Relatório de Bug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tickets</CardTitle>
          <CardDescription>
            Gerencie todos os tickets de suporte e contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tickets}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={getModalTitle()}
        fields={formFields}
        onSubmit={handleSubmit}
        loading={loading}
        defaultValues={selectedTicket ? {
          title: selectedTicket.title,
          description: selectedTicket.description,
          category: selectedTicket.category,
          priority: selectedTicket.priority
        } : undefined}
      />
    </div>
  )
}