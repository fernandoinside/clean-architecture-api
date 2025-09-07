'use client'

import { useEffect, useState } from 'react'
import { usePaymentStore } from '@/store/payment'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
import { MetadataField } from '@/components/forms/MetadataField'
import { Plus, Search, CreditCard, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { Payment, CreatePaymentData, UpdatePaymentData, PaymentStatus } from '@/types'

export default function PaymentsPage() {
  const { 
    payments, 
    selectedPayment,
    loading, 
    filters, 
    pagination,
    fetchPayments, 
    createPayment, 
    updatePayment, 
    deletePayment,
    setSelectedPayment,
    setFilters 
  } = usePaymentStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')

  // Local form state for create/edit
  const [formData, setFormData] = useState<CreatePaymentData>({
    user_id: 1,
    subscription_id: 1,
    amount: 0,
    currency: 'BRL',
    payment_method: 'credit_card',
    status: 'pending',
    transaction_id: ''
  })

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // Sync form when opening edit
  useEffect(() => {
    if (editingPayment) {
      setFormData({
        user_id: editingPayment.user_id,
        subscription_id: editingPayment.subscription_id,
        amount: editingPayment.amount,
        currency: editingPayment.currency,
        payment_method: editingPayment.payment_method,
        status: editingPayment.status,
        transaction_id: editingPayment.transaction_id || ''
      })
    } else {
      setFormData({
        user_id: 1,
        subscription_id: 1,
        amount: 0,
        currency: 'BRL',
        payment_method: 'credit_card',
        status: 'pending',
        transaction_id: ''
      })
    }
  }, [editingPayment, isModalOpen])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, page: 1 }
    // Note: API doesn't have search by transaction_id in docs, but we'll use it anyway
    setFilters(newFilters)
    fetchPayments(newFilters)
  }

  const handleStatusFilter = (status: PaymentStatus | 'all') => {
    setStatusFilter(status)
    const newFilters = { ...filters, page: 1 }
    if (status !== 'all') {
      newFilters.status = status
    } else {
      delete newFilters.status
    }
    setFilters(newFilters)
    fetchPayments(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchPayments(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchPayments(newFilters)
  }

  const openCreateModal = () => {
    setEditingPayment(null)
    setIsModalOpen(true)
  }

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPayment(null)
  }

  const handleSubmit = async (data: CreatePaymentData | UpdatePaymentData) => {
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, data as UpdatePaymentData)
      } else {
        await createPayment(data as CreatePaymentData)
      }
      closeModal()
      fetchPayments(filters)
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error)
      throw error
    }
  }

  const handleDelete = async (payment: Payment) => {
    if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
      try {
        await deletePayment(payment.id)
        fetchPayments(filters)
      } catch (error) {
        console.error('Erro ao excluir pagamento:', error)
      }
    }
  }

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: PaymentStatus) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'refunded': 'bg-blue-100 text-blue-800'
    }
    
    return colors[status]
  }

  const getStatusIcon = (status: PaymentStatus) => {
    const icons = {
      'pending': AlertCircle,
      'completed': CreditCard,
      'failed': AlertCircle,
      'cancelled': AlertCircle,
      'refunded': TrendingUp
    }
    
    return icons[status]
  }

  const getPaymentMethodColor = (method: string) => {
    const colors = {
      'credit_card': 'bg-blue-100 text-blue-800',
      'debit_card': 'bg-purple-100 text-purple-800',
      'bank_transfer': 'bg-green-100 text-green-800',
      'pix': 'bg-orange-100 text-orange-800',
      'paypal': 'bg-yellow-100 text-yellow-800'
    } as Record<string, string>
    
    return colors[method] || 'bg-gray-100 text-gray-800'
  }

  const columns = [
    {
      key: 'transaction_id' as keyof Payment,
      title: 'Transação',
      sortable: true,
      render: (payment: Payment) => (
        <div className="font-mono text-sm">
          {payment.transaction_id || 'N/A'}
        </div>
      )
    },
    {
      key: 'amount' as keyof Payment,
      title: 'Valor',
      sortable: true,
      render: (payment: Payment) => (
        <div className="font-semibold">
          {formatCurrency(payment.amount, payment.currency)}
        </div>
      )
    },
    {
      key: 'payment_method' as keyof Payment,
      title: 'Método',
      sortable: true,
      render: (payment: Payment) => (
        <Badge className={getPaymentMethodColor(payment.payment_method)}>
          {payment.payment_method.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'status' as keyof Payment,
      title: 'Status',
      sortable: true,
      render: (payment: Payment) => {
        const StatusIcon = getStatusIcon(payment.status)
        return (
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <Badge className={getStatusColor(payment.status)}>
              {payment.status}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'user_id' as keyof Payment,
      title: 'Usuário',
      sortable: true,
      render: (payment: Payment) => (
        <div className="text-sm">
          ID: {payment.user_id}
        </div>
      )
    },
    {
      key: 'created_at' as keyof Payment,
      title: 'Data',
      sortable: true,
      render: (payment: Payment) => 
        new Date(payment.created_at).toLocaleDateString('pt-BR')
    }
  ]

  // Form field options
  const currencyOptions = [
    { value: 'BRL', label: 'Real (BRL)' },
    { value: 'USD', label: 'Dólar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ]
  const methodOptions = [
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'bank_transfer', label: 'Transferência Bancária' },
    { value: 'pix', label: 'PIX' },
    { value: 'paypal', label: 'PayPal' }
  ]
  const statusOptions: { value: PaymentStatus, label: string }[] = [
    { value: 'pending', label: 'Pendente' },
    { value: 'completed', label: 'Concluído' },
    { value: 'failed', label: 'Falhado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'refunded', label: 'Reembolsado' }
  ]

  // Calcular estatísticas
  const totalAmount = payments.reduce((sum, payment) => 
    payment.status === 'completed' ? sum + payment.amount : sum, 0
  )
  const completedCount = payments.filter(p => p.status === 'completed').length
  const pendingCount = payments.filter(p => p.status === 'pending').length
  const failedCount = payments.filter(p => p.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pagamentos</h2>
          <p className="text-muted-foreground">
            Gerencie pagamentos e transações do sistema
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount, 'BRL')}</div>
            <p className="text-xs text-muted-foreground">
              em pagamentos concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              pagamentos aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <p className="text-xs text-muted-foreground">
              pagamentos com erro
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pagamentos..."
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
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="failed">Falhado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={payments}
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
        open={isModalOpen}
        onClose={closeModal}
        title={editingPayment ? 'Editar Pagamento' : 'Novo Pagamento'}
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            await handleSubmit(editingPayment ? (formData as UpdatePaymentData) : formData)
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">ID do Usuário</label>
              <Input
                type="number"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: Number(e.target.value) })}
                placeholder="ID do usuário"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">ID da Assinatura</label>
              <Input
                type="number"
                value={formData.subscription_id}
                onChange={(e) => setFormData({ ...formData, subscription_id: Number(e.target.value) })}
                placeholder="ID da assinatura"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                placeholder="99.99"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Moeda</label>
              <Select
                value={formData.currency}
                onValueChange={(v) => setFormData({ ...formData, currency: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Método de Pagamento</label>
              <Select
                value={formData.payment_method}
                onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {methodOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as PaymentStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">ID da Transação</label>
              <Input
                type="text"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                placeholder="ID da transação externa"
              />
            </div>
          </div>

          {/* Campos Pagar.me específicos */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 text-gray-700">Dados Pagar.me</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">ID Transação Pagar.me</label>
                <Input
                  type="text"
                  placeholder="tran_xxxxxx"
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ID Charge Pagar.me</label>
                <Input
                  type="text"
                  placeholder="ch_xxxxxx"
                  className="font-mono text-xs"
                />
              </div>
              
              {formData.payment_method === 'pix' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Código PIX QR</label>
                    <Input
                      type="text"
                      placeholder="Código PIX para pagamento"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL PIX QR Code</label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">PIX Expira em</label>
                    <Input
                      type="datetime-local"
                    />
                  </div>
                </>
              )}
              
              {formData.payment_method === 'credit_card' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Últimos 4 dígitos</label>
                    <Input
                      type="text"
                      maxLength={4}
                      placeholder="****"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bandeira</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Bandeira do cartão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="mastercard">Mastercard</SelectItem>
                        <SelectItem value="amex">American Express</SelectItem>
                        <SelectItem value="elo">Elo</SelectItem>
                        <SelectItem value="discover">Discover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nome no Cartão</label>
                    <Input
                      type="text"
                      placeholder="NOME COMPLETO"
                      className="uppercase"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="text-sm font-medium">Taxa Pagar.me</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="5.99"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Código Adquirente</label>
                <Input
                  type="text"
                  placeholder="00"
                  className="font-mono"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Mensagem Adquirente</label>
                <Input
                  type="text"
                  placeholder="Transação aprovada"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingPayment ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </FormModal>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {(() => {
                      const StatusIcon = getStatusIcon(selectedPayment.status)
                      return <StatusIcon className="h-5 w-5" />
                    })()}
                    Pagamento #{selectedPayment.id}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.transaction_id ? `Transação: ${selectedPayment.transaction_id}` : 'Sem ID de transação'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPayment(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <MetadataField 
                  label="Valor" 
                  value={
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                    </div>
                  } 
                />
                
                <MetadataField 
                  label="Status" 
                  value={
                    <Badge className={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  } 
                />
                
                <MetadataField 
                  label="Método de Pagamento" 
                  value={
                    <Badge className={getPaymentMethodColor(selectedPayment.payment_method)}>
                      {selectedPayment.payment_method.replace('_', ' ')}
                    </Badge>
                  } 
                />
                
                <MetadataField label="Usuário" value={`ID: ${selectedPayment.user_id}`} />
                
                <MetadataField label="Assinatura" value={`ID: ${selectedPayment.subscription_id}`} />
                
                <MetadataField label="Moeda" value={selectedPayment.currency} />
                
                {selectedPayment.transaction_id && (
                  <MetadataField 
                    label="ID da Transação" 
                    value={
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {selectedPayment.transaction_id}
                      </code>
                    } 
                  />
                )}
                
                <MetadataField 
                  label="Criado em" 
                  value={new Date(selectedPayment.created_at).toLocaleString('pt-BR')} 
                />
                
                <MetadataField 
                  label="Atualizado em" 
                  value={new Date(selectedPayment.updated_at).toLocaleString('pt-BR')} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}