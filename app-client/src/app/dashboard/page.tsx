'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCompanyStore } from '@/store/company'
import { useCustomerStore } from '@/store/customer'
import { Building2, Users, Plus, Activity, TrendingUp, Calendar, Eye } from 'lucide-react'

export default function DashboardPage() {
  const { 
    companies, 
    pagination: companiesPagination, 
    loading: companiesLoading, 
    fetchCompanies 
  } = useCompanyStore()

  const { 
    customers, 
    pagination: customersPagination, 
    loading: customersLoading, 
    fetchCustomers 
  } = useCustomerStore()

  useEffect(() => {
    // Buscar dados para estatísticas
    fetchCompanies({ page: 1, limit: 1000 }) // Buscar todas para contagem
    fetchCustomers({ page: 1, limit: 1000 }) // Buscar todos para contagem
  }, [fetchCompanies, fetchCustomers])

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Estatísticas de clientes
    const activeCustomers = customers.filter(customer => customer.status === 'active').length
    const newCustomersThisMonth = customers.filter(customer => {
      const createdDate = new Date(customer.created_at)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    }).length

    // Estatísticas de empresas
    const activeCompanies = companies.filter(company => company.status === 'active').length

    return {
      totalCompanies: companiesPagination?.total || companies.length,
      totalCustomers: customersPagination?.total || customers.length,
      activeCustomers,
      activeCompanies,
      newCustomersThisMonth
    }
  }, [companies, customers, companiesPagination, customersPagination])

  const isLoading = companiesLoading || customersLoading

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo ao sistema de gestão SRM. Visão geral dos seus dados.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empresas
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats.totalCompanies}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-600 mr-1">{stats.activeCompanies} ativas</span>
              • Total cadastradas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : stats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Todos os clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {isLoading ? '...' : stats.activeCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                Status ativo
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Este Mês
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : stats.newCustomersThisMonth}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Plus className="h-3 w-3 mr-1" />
              Clientes cadastrados em {new Date().toLocaleString('pt-BR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Gestão de Empresas
            </CardTitle>
            <CardDescription>
              Cadastre, edite e gerencie empresas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Cadastro completo com informações de contato</li>
                <li>• Campos personalizáveis via metadata</li>
                <li>• Controle de status (ativo, inativo, suspenso)</li>
                <li>• Busca e filtros avançados</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/dashboard/companies">
                  Acessar Empresas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              Gestão de Clientes
            </CardTitle>
            <CardDescription>
              Gerencie clientes e seus endereços de forma integrada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Sistema de abas (Dados Pessoais + Endereços)</li>
                <li>• Múltiplos endereços por cliente</li>
                <li>• Definição de endereço padrão</li>
                <li>• Campos flexíveis com metadata JSON</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/dashboard/customers">
                  Acessar Clientes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimos registros criados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-4 animate-pulse opacity-50" />
                <p>Carregando atividades recentes...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Atividades recentes combinadas */}
                {(() => {
                  // Combinar e ordenar por data de criação
                  const recentActivities = [
                    ...companies.slice(0, 5).map(company => ({
                      id: `company-${company.id}`,
                      type: 'company',
                      name: company.name,
                      createdAt: new Date(company.created_at),
                      status: company.status
                    })),
                    ...customers.slice(0, 5).map(customer => ({
                      id: `customer-${customer.id}`,
                      type: 'customer',
                      name: customer.name,
                      createdAt: new Date(customer.created_at),
                      status: customer.status
                    }))
                  ]
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .slice(0, 10)

                  if (recentActivities.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma atividade recente registrada</p>
                        <p className="text-sm">Comece criando empresas e clientes para ver atividades aqui</p>
                      </div>
                    )
                  }

                  return recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0">
                        {activity.type === 'company' ? (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.name}
                          </p>
                          <Badge 
                            variant={activity.status === 'active' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {activity.type === 'company' ? 'Empresa' : 'Cliente'} criado em{' '}
                          {activity.createdAt.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={activity.type === 'company' ? '/dashboard/companies' : '/dashboard/customers'}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}