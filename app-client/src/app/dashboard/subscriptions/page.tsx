'use client'

import { useEffect, useState } from 'react'
import { useSubscriptionStore } from '@/store/subscription'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { Plus, Search, Crown, Calendar, Building, CheckCircle, XCircle, Clock, AlertCircle, CreditCard } from 'lucide-react'
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionStatus, BillingCycle } from '@/types'

export default function SubscriptionsPage() {
  const { 
    subscriptions, 
    selectedSubscription,
    loading, 
    filters, 
    pagination,
    fetchSubscriptions, 
    createSubscription, 
    updateSubscription, 
    deleteSubscription,
    setSelectedSubscription,
    setFilters 
  } = useSubscriptionStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all')
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | 'all'>('all')
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // API doesn't have search in docs, but we'll trigger a refetch
    fetchSubscriptions(filters)
  }

  const handleStatusFilter = (status: SubscriptionStatus | 'all') => {
    setStatusFilter(status)
    const newFilters = { ...filters, page: 1 }
    if (status !== 'all') {
      newFilters.status = status
    } else {
      delete newFilters.status
    }
    setFilters(newFilters)
    fetchSubscriptions(newFilters)
  }

  const handleCycleFilter = (cycle: BillingCycle | 'all') => {
    setCycleFilter(cycle)
    // API doesn't have billing_cycle filter in docs, but we'll add it
    const newFilters = { ...filters, page: 1 }
    setFilters(newFilters)
    fetchSubscriptions(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchSubscriptions(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchSubscriptions(newFilters)
  }

  const openCreateModal = () => {
    setEditingSubscription(null)
    setIsModalOpen(true)
  }

  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSubscription(null)
  }

  const handleSubmit = async (data: any) => {
    try {
      // Remove subscription_type do data e processa company_id/customer_id
      const { subscription_type, company_id, customer_id, ...restData } = data;
      
      // Validar que apenas um tipo foi selecionado
      if (subscription_type === 'company' && !company_id) {
        throw new Error('ID da empresa é obrigatório quando tipo é "Empresa"');
      }
      if (subscription_type === 'customer' && !customer_id) {
        throw new Error('ID do cliente é obrigatório quando tipo é "Cliente"');
      }
      
      const subscriptionData = {
        ...restData,
        company_id: subscription_type === 'company' ? Number(company_id) : null,
        customer_id: subscription_type === 'customer' ? Number(customer_id) : null,
        current_period_start: restData.current_period_start ? new Date(restData.current_period_start).toISOString() : undefined,
        current_period_end: restData.current_period_end ? new Date(restData.current_period_end).toISOString() : undefined,
        trial_start: restData.trial_start ? new Date(restData.trial_start).toISOString() : null,
        trial_end: restData.trial_end ? new Date(restData.trial_end).toISOString() : null,
        auto_renew: restData.auto_renew === 'true',
        is_trial: restData.is_trial === 'true'
      }

      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, subscriptionData as UpdateSubscriptionData)
      } else {
        await createSubscription(subscriptionData as CreateSubscriptionData)
      }
      closeModal()
      fetchSubscriptions(filters)
    } catch (error) {
      console.error('Erro ao salvar assinatura:', error)
      throw error
    }
  }

  const handleDelete = async (subscription: Subscription) => {
    if (window.confirm('Tem certeza que deseja excluir esta assinatura?')) {
      try {
        await deleteSubscription(subscription.id)
        fetchSubscriptions(filters)
      } catch (error) {
        console.error('Erro ao excluir assinatura:', error)
      }
    }
  }

  const handleView = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
  }

  const getStatusColor = (status: SubscriptionStatus) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    }
    
    return colors[status]
  }

  const getStatusIcon = (status: SubscriptionStatus) => {
    const icons = {
      'active': CheckCircle,
      'inactive': XCircle,
      'cancelled': XCircle,
      'pending': Clock
    }
    
    return icons[status]
  }

  const getCycleLabel = (cycle: BillingCycle) => {
    return cycle === 'monthly' ? 'Mensal' : 'Anual'
  }

  const getCycleColor = (cycle: BillingCycle) => {
    return cycle === 'monthly' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800'
  }

  const isExpiringSoon = (endDate?: string) => {
    if (!endDate) return false
    const today = new Date()
    const expiry = new Date(endDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isExpired = (endDate?: string) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  const columns = [
    {
      key: 'id' as keyof Subscription,
      title: 'ID',
      sortable: true,
      render: (subscription: Subscription) => (
        <div className="font-mono text-sm">#{subscription.id}</div>
      )
    },
    {
      key: 'company_id' as keyof Subscription,
      title: 'Cliente',
      sortable: true,
      render: (subscription: Subscription) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          {subscription.company_id ? (
            <div>
              <div className="text-xs text-muted-foreground">Empresa</div>
              <span className="text-sm">ID: {subscription.company_id}</span>
            </div>
          ) : subscription.customer_id ? (
            <div>
              <div className="text-xs text-muted-foreground">Cliente</div>
              <span className="text-sm">ID: {subscription.customer_id}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      )
    },
    {
      key: 'plan_id' as keyof Subscription,
      title: 'Plano',
      sortable: true,
      render: (subscription: Subscription) => (
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">ID: {subscription.plan_id}</span>
        </div>
      )
    },
    {
      key: 'auto_renew' as keyof Subscription,
      title: 'Auto Renew',
      sortable: true,
      render: (subscription: Subscription) => (
        <Badge className={subscription.auto_renew ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
          {subscription.auto_renew ? 'Sim' : 'Não'}
        </Badge>
      )
    },
    {
      key: 'status' as keyof Subscription,
      title: 'Status',
      sortable: true,
      render: (subscription: Subscription) => {
        const StatusIcon = getStatusIcon(subscription.status)
        const expiring = isExpiringSoon(subscription.current_period_end || undefined)
        const expired = isExpired(subscription.current_period_end || undefined)
        
        return (
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <div className="space-y-1">
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status}
              </Badge>
              {(expiring || expired) && (
                <div>
                  <Badge variant="outline" className={expired ? 'text-red-600 border-red-600' : 'text-yellow-600 border-yellow-600'}>
                    {expired ? 'Expirada' : 'Expira em breve'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      key: 'current_period_end' as keyof Subscription,
      title: 'Fim do Período',
      sortable: true,
      render: (subscription: Subscription) => 
        subscription.current_period_end ? (
          <div className="text-sm">
            <div>{new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}</div>
            {isExpiringSoon(subscription.current_period_end) && (
              <div className="text-yellow-600 text-xs">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Expira em breve
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Sem data de término</span>
        )
    },
    {
      key: 'created_at' as keyof Subscription,
      title: 'Criada em',
      sortable: true,
      render: (subscription: Subscription) => 
        new Date(subscription.created_at).toLocaleDateString('pt-BR')
    }
  ]

  const formFields = [
    {
      name: 'subscription_type',
      label: 'Tipo de Assinatura',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'company', label: 'Empresa' },
        { value: 'customer', label: 'Cliente' }
      ]
    },
    {
      name: 'company_id',
      label: 'ID da Empresa',
      type: 'number' as const,
      required: false,
      placeholder: 'ID da empresa'
    },
    {
      name: 'customer_id',
      label: 'ID do Cliente',
      type: 'number' as const,
      required: false,
      placeholder: 'ID do cliente'
    },
    {
      name: 'plan_id',
      label: 'ID do Plano',
      type: 'number' as const,
      required: true,
      placeholder: 'ID do plano'
    },
    {
      name: 'current_period_start',
      label: 'Início do Período',
      type: 'datetime-local' as const,
      required: true
    },
    {
      name: 'current_period_end',
      label: 'Fim do Período',
      type: 'datetime-local' as const,
      required: true
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'pending', label: 'Pendente' },
        { value: 'active', label: 'Ativa' },
        { value: 'inactive', label: 'Inativa' },
        { value: 'cancelled', label: 'Cancelada' }
      ]
    },
    {
      name: 'pagarme_subscription_id',
      label: 'ID Pagar.me Subscription',
      type: 'text' as const,
      required: false,
      placeholder: 'sub_xxxxxx'
    },
    {
      name: 'pagarme_customer_id',
      label: 'ID Pagar.me Customer',
      type: 'text' as const,
      required: false,
      placeholder: 'cus_xxxxxx'
    },
    {
      name: 'pagarme_card_id',
      label: 'ID Pagar.me Card',
      type: 'text' as const,
      required: false,
      placeholder: 'card_xxxxxx'
    },
    {
      name: 'payment_method',
      label: 'Método de Pagamento',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'pix', label: 'PIX' },
        { value: 'credit_card', label: 'Cartão de Crédito' }
      ]
    },
    {
      name: 'trial_start',
      label: 'Início do Trial',
      type: 'datetime-local' as const,
      required: false
    },
    {
      name: 'trial_end',
      label: 'Fim do Trial',
      type: 'datetime-local' as const,
      required: false
    },
    {
      name: 'auto_renew',
      label: 'Renovação Automática',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'true', label: 'Sim' },
        { value: 'false', label: 'Não' }
      ]
    },
    {
      name: 'is_trial',
      label: 'É Trial?',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'true', label: 'Sim' },
        { value: 'false', label: 'Não' }
      ]
    }
  ]

  const defaultValues = editingSubscription ? {
    ...editingSubscription,
    subscription_type: editingSubscription.company_id ? 'company' : 'customer',
    current_period_start: editingSubscription.current_period_start ? 
      new Date(editingSubscription.current_period_start).toISOString().slice(0, 16) : '',
    current_period_end: editingSubscription.current_period_end ? 
      new Date(editingSubscription.current_period_end).toISOString().slice(0, 16) : '',
    trial_start: editingSubscription.trial_start ? 
      new Date(editingSubscription.trial_start).toISOString().slice(0, 16) : '',
    trial_end: editingSubscription.trial_end ? 
      new Date(editingSubscription.trial_end).toISOString().slice(0, 16) : '',
    auto_renew: editingSubscription.auto_renew?.toString() || 'true',
    is_trial: editingSubscription.is_trial?.toString() || 'false',
    pagarme_subscription_id: editingSubscription.pagarme_subscription_id || '',
    pagarme_customer_id: editingSubscription.pagarme_customer_id || '',
    pagarme_card_id: editingSubscription.pagarme_card_id || '',
    payment_method: editingSubscription.payment_method || 'pix'
  } : {
    subscription_type: 'company',
    company_id: 1,
    customer_id: '',
    plan_id: 1,
    current_period_start: new Date().toISOString().slice(0, 16),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 30 days
    status: 'active' as SubscriptionStatus,
    auto_renew: 'true',
    is_trial: 'false',
    pagarme_subscription_id: '',
    pagarme_customer_id: '',
    pagarme_card_id: '',
    payment_method: 'pix',
    trial_start: '',
    trial_end: ''
  }

  // Calcular estatísticas
  const activeCount = subscriptions.filter(s => s.status === 'active').length
  const pendingCount = subscriptions.filter(s => s.status === 'pending').length
  const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length
  const expiringSoonCount = subscriptions.filter(s => 
    s.status === 'active' && isExpiringSoon(s.current_period_end || undefined)
  ).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assinaturas</h2>
          <p className="text-muted-foreground">
            Gerencie assinaturas de empresas e planos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCheckout(true)} variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Teste Checkout
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              assinaturas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              assinaturas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              aguardando ativação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirando</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringSoonCount}</div>
            <p className="text-xs text-muted-foreground">
              expiram em 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar assinaturas..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="inactive">Inativas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cycleFilter} onValueChange={handleCycleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ciclo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={subscriptions}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onView={handleView}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        title={editingSubscription ? 'Editar Assinatura' : 'Nova Assinatura'}
        fields={formFields}
        defaultValues={defaultValues}
        loading={loading}
      />

      {selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Assinatura #{selectedSubscription.id}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.company_id ? `Empresa: ${selectedSubscription.company_id}` : `Cliente: ${selectedSubscription.customer_id}`} | Plano: {selectedSubscription.plan_id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubscription(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Status:</label>
                    <div className="mt-1 flex items-center gap-2">
                      {(() => {
                        const StatusIcon = getStatusIcon(selectedSubscription.status)
                        return <StatusIcon className="h-4 w-4" />
                      })()}
                      <Badge className={getStatusColor(selectedSubscription.status)}>
                        {selectedSubscription.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Renovação Automática:</label>
                    <div className="mt-1">
                      <Badge className={selectedSubscription.auto_renew ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedSubscription.auto_renew ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">
                      {selectedSubscription.company_id ? 'Empresa:' : 'Cliente:'}
                    </label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        ID: {selectedSubscription.company_id || selectedSubscription.customer_id}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Plano:</label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        ID: {selectedSubscription.plan_id}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-600">Data de Criação:</label>
                  <div className="mt-1 text-sm">{new Date(selectedSubscription.created_at).toLocaleDateString('pt-BR')}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Início do Período:</label>
                    <div className="mt-1 text-sm">{new Date(selectedSubscription.current_period_start).toLocaleDateString('pt-BR')}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Fim do Período:</label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm">{new Date(selectedSubscription.current_period_end).toLocaleDateString('pt-BR')}</span>
                      {isExpired(selectedSubscription.current_period_end) && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Expirada
                        </Badge>
                      )}
                      {isExpiringSoon(selectedSubscription.current_period_end) && !isExpired(selectedSubscription.current_period_end) && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Expira em breve
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedSubscription.payment_method && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Método de Pagamento:</label>
                    <div className="mt-1 text-sm">{selectedSubscription.payment_method}</div>
                  </div>
                )}
                
                {selectedSubscription.notes && (
                  <div>
                    <label className="text-sm font-medium">Observações:</label>
                    <div className="mt-2 p-4 border rounded-md bg-gray-50">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedSubscription.notes}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Criada em:</label>
                    <div className="mt-1 text-sm">{new Date(selectedSubscription.created_at).toLocaleString('pt-BR')}</div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-600">Atualizada em:</label>
                    <div className="mt-1 text-sm">{new Date(selectedSubscription.updated_at).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout para Teste */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Teste de Checkout - Pagar.me</h2>
                <Button 
                  onClick={() => setShowCheckout(false)} 
                  variant="outline"
                  size="sm"
                >
                  ×
                </Button>
              </div>
              
              <CheckoutForm
                planId={1} // ID de teste - você pode ajustar
                subscriptionType="company"
                entityId={1} // ID de teste - você pode ajustar
                onSuccess={(payment) => {
                  console.log('Pagamento realizado com sucesso:', payment)
                  alert('Pagamento realizado com sucesso! Verifique o console para detalhes.')
                  setShowCheckout(false)
                  fetchSubscriptions() // Recarregar assinaturas
                }}
                onError={(error) => {
                  console.error('Erro no pagamento:', error)
                  alert(`Erro no pagamento: ${error}`)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}