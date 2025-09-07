'use client'

import { useEffect, useState } from 'react'
import { usePlanStore } from '@/store/plan'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
import { Plus, Search, Package, DollarSign, Crown, Users, Pencil, Trash2, Calendar, Clock } from 'lucide-react'
import { Plan, CreatePlanData, UpdatePlanData, PlanInterval } from '@/types'

export default function PlansPage() {
  const { 
    plans, 
    selectedPlan,
    loading, 
    filters, 
    pagination,
    fetchPlans, 
    createPlan, 
    updatePlan, 
    deletePlan,
    setSelectedPlan,
    setFilters 
  } = usePlanStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [intervalFilter, setIntervalFilter] = useState<PlanInterval | 'all'>('all')
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'BRL',
    interval: 'monthly' as PlanInterval,
    features: '',
    is_active: 'true'
  })

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, page: 1 }
    if (query) {
      newFilters.name = query
    } else {
      delete newFilters.name
    }
    setFilters(newFilters)
    fetchPlans(newFilters)
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
    fetchPlans(newFilters)
  }

  const handleIntervalFilter = (interval: PlanInterval | 'all') => {
    setIntervalFilter(interval)
    const newFilters = { ...filters, page: 1 }
    // Note: API doesn't have interval filter in docs, but we'll add it
    setFilters(newFilters)
    fetchPlans(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchPlans(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchPlans(newFilters)
  }

  const openCreateModal = () => {
    setEditingPlan(null)
    setFormValues({
      name: '',
      description: '',
      price: 0,
      currency: 'BRL',
      interval: 'monthly',
      features: '',
      is_active: 'true'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan)
    setFormValues({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: Array.isArray(plan.features) ? plan.features.join(', ') : (plan.features || ''),
      is_active: String(!!plan.is_active)
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPlan(null)
  }

  const handleSubmitForm = async () => {
    try {
      const planData = {
        name: formValues.name,
        description: formValues.description || '',
        price: Number(formValues.price),
        currency: formValues.currency,
        interval: formValues.interval,
        features: (formValues.features || '')
          .split(',')
          .map(f => f.trim())
          .filter(f => f.length > 0),
        is_active: formValues.is_active === 'true'
      }

      if (editingPlan) {
        await updatePlan(editingPlan.id, planData as UpdatePlanData)
      } else {
        await createPlan(planData as CreatePlanData)
      }
      closeModal()
      fetchPlans(filters)
    } catch (error) {
      console.error('Erro ao salvar plano:', error)
      // Deixe o erro propagar para possíveis toasts superiores
      throw error
    }
  }

  const handleDelete = async (plan: Plan) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await deletePlan(plan.id)
        fetchPlans(filters)
      } catch (error) {
        console.error('Erro ao excluir plano:', error)
      }
    }
  }

  const handleView = (plan: Plan) => {
    setSelectedPlan(plan)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(amount)
  }

  const getIntervalLabel = (interval: PlanInterval) => {
    return interval === 'monthly' ? 'Mensal' : 'Anual'
  }

  const getIntervalColor = (interval: PlanInterval) => {
    return interval === 'monthly' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800'
  }

  const columns = [
    {
      key: 'name' as keyof Plan,
      title: 'Nome do Plano',
      sortable: true,
      render: (plan: Plan) => (
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{plan.name}</div>
            <div className="text-sm text-muted-foreground truncate max-w-32">
              {plan.description || 'Sem descrição'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'price' as keyof Plan,
      title: 'Preço',
      sortable: true,
      render: (plan: Plan) => (
        <div className="font-semibold">
          {formatCurrency(plan.price, plan.currency)}
        </div>
      )
    },
    {
      key: 'interval' as keyof Plan,
      title: 'Periodicidade',
      sortable: true,
      render: (plan: Plan) => (
        <Badge className={getIntervalColor(plan.interval)}>
          {getIntervalLabel(plan.interval)}
        </Badge>
      )
    },
    {
      key: 'features' as keyof Plan,
      title: 'Recursos',
      sortable: false,
      render: (plan: Plan) => (
        <div className="text-sm">
          {plan.features.length > 0 ? (
            <span className="text-muted-foreground">
              {plan.features.length} recurso{plan.features.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-muted-foreground">Nenhum recurso</span>
          )}
        </div>
      )
    },
    {
      key: 'is_active' as keyof Plan,
      title: 'Status',
      sortable: true,
      render: (plan: Plan) => (
        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
          {plan.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'created_at' as keyof Plan,
      title: 'Criado em',
      sortable: true,
      render: (plan: Plan) => 
        new Date(plan.created_at).toLocaleDateString('pt-BR')
    }
  ]

  // Calcular estatísticas
  const activePlans = plans.filter(p => p.is_active).length
  const inactivePlans = plans.filter(p => p.is_active === false).length
  const monthlyPlans = plans.filter(p => p.interval === 'monthly').length
  const yearlyPlans = plans.filter(p => p.interval === 'yearly').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planos</h2>
          <p className="text-muted-foreground">
            Gerencie planos de assinatura e preços
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              planos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Crown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePlans}</div>
            <p className="text-xs text-muted-foreground">
              disponíveis para venda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensais</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{monthlyPlans}</div>
            <p className="text-xs text-muted-foreground">
              cobrança mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anuais</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{yearlyPlans}</div>
            <p className="text-xs text-muted-foreground">
              cobrança anual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planos..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={activeFilter} onValueChange={handleActiveFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={intervalFilter} onValueChange={handleIntervalFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Periodicidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={plans}
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
        title={editingPlan ? 'Editar Plano' : 'Novo Plano'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmitForm()
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                required
                placeholder="Ex: Plano Básico"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                required
                value={formValues.price}
                onChange={(e) => setFormValues({ ...formValues, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={formValues.currency}
                onValueChange={(v) => setFormValues({ ...formValues, currency: v })}
              >
                <SelectTrigger id="currency"><SelectValue placeholder="Moeda" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interval">Periodicidade</Label>
              <Select
                value={formValues.interval}
                onValueChange={(v) => setFormValues({ ...formValues, interval: v as PlanInterval })}
              >
                <SelectTrigger id="interval"><SelectValue placeholder="Periodicidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Descrição do plano..."
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Recursos (separados por vírgula)</Label>
            <Textarea
              id="features"
              rows={3}
              placeholder="Recurso 1, Recurso 2, Recurso 3"
              value={formValues.features}
              onChange={(e) => setFormValues({ ...formValues, features: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_active">Ativo</Label>
            <Select
              value={formValues.is_active}
              onValueChange={(v) => setFormValues({ ...formValues, is_active: v })}
            >
              <SelectTrigger id="is_active"><SelectValue placeholder="Ativo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingPlan ? 'Salvar alterações' : 'Criar plano'}
            </Button>
          </div>
        </form>
      </FormModal>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-purple-700 text-xs font-medium">
                    <Crown className="h-4 w-4" /> Plano
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight">{selectedPlan.name}</h3>
                  {selectedPlan.description && (
                    <p className="text-sm text-muted-foreground max-w-prose">{selectedPlan.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPlan(null)
                    }}
                  >
                    Fechar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const plan = selectedPlan
                      setSelectedPlan(null)
                      openEditModal(plan)
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedPlan)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </Button>
                </div>
              </div>

              {/* Price and status summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="col-span-1 sm:col-span-2 rounded-lg border p-4 bg-gradient-to-br from-green-50 to-white">
                  <div className="text-sm text-muted-foreground">Preço</div>
                  <div className="mt-1 text-2xl font-bold text-green-600">
                    {formatCurrency(selectedPlan.price, selectedPlan.currency)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{selectedPlan.interval === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground mb-2">Status</div>
                  <Badge variant={selectedPlan.is_active ? 'default' : 'secondary'}>
                    {selectedPlan.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Periodicidade</div>
                    <div className="mt-1">
                      <Badge className={getIntervalColor(selectedPlan.interval)}>
                        {getIntervalLabel(selectedPlan.interval)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Moeda</div>
                    <div className="mt-1 text-sm font-medium">{selectedPlan.currency}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Criado em
                  </div>
                  <div className="text-sm font-medium">{new Date(selectedPlan.created_at).toLocaleString('pt-BR')}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> Atualizado em
                  </div>
                  <div className="text-sm font-medium">{new Date(selectedPlan.updated_at).toLocaleString('pt-BR')}</div>
                </div>
              </div>

              {/* Features */}
              {selectedPlan.features.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm text-muted-foreground mb-2">Recursos inclusos</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlan.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}