'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/users'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
import { Plus, Search, Users, UserCheck, UserX, Mail } from 'lucide-react'
import { User, CreateUserData, UpdateUserData } from '@/types'

export default function UsersPage() {
  const { 
    users, 
    selectedUser,
    loading, 
    filters, 
    pagination,
    fetchUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    setSelectedUser,
    setFilters 
  } = useUserStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isActiveValue, setIsActiveValue] = useState<string>('true')
  const [emailVerifiedValue, setEmailVerifiedValue] = useState<string>('false')

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, page: 1 }
    if (query) {
      newFilters.search = query
    } else {
      delete newFilters.search
    }
    setFilters(newFilters)
    fetchUsers(newFilters)
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
    fetchUsers(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchUsers(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchUsers(newFilters)
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setIsModalOpen(true)
    setIsActiveValue('true')
    setEmailVerifiedValue('false')
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
    setIsActiveValue(user.is_active ? 'true' : 'false')
    setEmailVerifiedValue(user.email_verified ? 'true' : 'false')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  type FormValues = {
    username?: string
    email: string
    password?: string
    first_name?: string
    last_name?: string
    role_id?: string | number
    company_id?: string | number
    is_active?: string | boolean
    email_verified?: string | boolean
  }

  const handleSubmit = async (data: CreateUserData | UpdateUserData) => {
    try {
      const toNumber = (v: unknown): number | undefined => {
        if (v === '' || v === undefined || v === null) return undefined
        const n = Number(v)
        return Number.isNaN(n) ? undefined : n
      }

      const toBool = (v: unknown): boolean | undefined => {
        if (v === undefined || v === null || v === '') return undefined
        if (typeof v === 'boolean') return v
        if (typeof v === 'string') return v === 'true'
        return undefined
      }

      const d = data as FormValues

      if (editingUser) {
        const payload: UpdateUserData = {
          email: d.email,
          first_name: d.first_name || undefined,
          last_name: d.last_name || undefined,
          role_id: toNumber(d.role_id),
          company_id: toNumber(d.company_id),
          is_active: toBool(d.is_active),
          email_verified: toBool(d.email_verified),
        }
        await updateUser(editingUser.id, payload)
      } else {
        const payload: CreateUserData = {
          username: d.username!,
          email: d.email,
          password: d.password!,
          first_name: d.first_name || undefined,
          last_name: d.last_name || undefined,
          role_id: toNumber(d.role_id),
          company_id: toNumber(d.company_id),
          is_active: toBool(d.is_active) ?? true,
        }
        await createUser(payload)
      }
      closeModal()
      fetchUsers(filters)
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      throw error
    }
  }

  const handleDelete = async (user: User) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(user.id)
        fetchUsers(filters)
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
      }
    }
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
  }

  const getFullName = (user: User) => {
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
    return user.username
  }

  const columns = [
    {
      key: 'username' as keyof User,
      title: 'Usuário',
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{user.username}</div>
            <div className="text-sm text-muted-foreground">
              {getFullName(user)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email' as keyof User,
      title: 'E-mail',
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm">{user.email}</div>
            {user.email_verified && (
              <Badge variant="secondary" className="text-xs">
                Verificado
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'role_id' as keyof User,
      title: 'Papel',
      sortable: true,
      render: (user: User) => (
        <div className="text-sm">
          {user.role_id ? (
            <Badge variant="outline">
              ID: {user.role_id}
            </Badge>
          ) : (
            <span className="text-muted-foreground">Sem papel</span>
          )}
        </div>
      )
    },
    {
      key: 'company_id' as keyof User,
      title: 'Empresa',
      sortable: true,
      render: (user: User) => (
        <div className="text-sm">
          {user.company_id ? (
            <Badge variant="outline">
              ID: {user.company_id}
            </Badge>
          ) : (
            <span className="text-muted-foreground">Sem empresa</span>
          )}
        </div>
      )
    },
    {
      key: 'is_active' as keyof User,
      title: 'Status',
      sortable: true,
      render: (user: User) => {
        const StatusIcon = user.is_active ? UserCheck : UserX
        return (
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${user.is_active ? 'text-green-600' : 'text-red-600'}`} />
            <Badge variant={user.is_active ? 'default' : 'secondary'}>
              {user.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'created_at' as keyof User,
      title: 'Criado em',
      sortable: true,
      render: (user: User) => 
        new Date(user.created_at).toLocaleDateString('pt-BR')
    }
  ]

  const formFields = [
    {
      name: 'username',
      label: 'Nome de Usuário',
      type: 'text' as const,
      required: true,
      placeholder: 'Ex: joaosilva',
      disabled: !!editingUser // Username não pode ser alterado na edição
    },
    {
      name: 'email',
      label: 'E-mail',
      type: 'email' as const,
      required: true,
      placeholder: 'usuario@exemplo.com'
    },
    ...(!editingUser ? [{
      name: 'password',
      label: 'Senha',
      type: 'password' as const,
      required: true,
      placeholder: 'Mínimo 6 caracteres'
    }] : []),
    {
      name: 'first_name',
      label: 'Nome',
      type: 'text' as const,
      required: false,
      placeholder: 'João'
    },
    {
      name: 'last_name',
      label: 'Sobrenome',
      type: 'text' as const,
      required: false,
      placeholder: 'Silva'
    },
    {
      name: 'role_id',
      label: 'ID do Papel',
      type: 'number' as const,
      required: false,
      placeholder: 'ID do papel do usuário'
    },
    {
      name: 'company_id',
      label: 'ID da Empresa',
      type: 'number' as const,
      required: false,
      placeholder: 'ID da empresa'
    },
    {
      name: 'is_active',
      label: 'Usuário Ativo',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'true', label: 'Sim' },
        { value: 'false', label: 'Não' }
      ]
    },
    ...(editingUser ? [{
      name: 'email_verified',
      label: 'E-mail Verificado',
      type: 'select' as const,
      required: false,
      options: [
        { value: 'true', label: 'Sim' },
        { value: 'false', label: 'Não' }
      ]
    }] : [])
  ]

  const defaultValues = editingUser ? {
    ...editingUser,
    role_id: editingUser.role_id || '',
    company_id: editingUser.company_id || '',
    is_active: editingUser.is_active.toString(),
    email_verified: editingUser.email_verified?.toString() || 'false'
  } : {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: '',
    company_id: '',
    is_active: 'true'
  }

  // Calcular estatísticas
  const activeUsers = users.filter(u => u.is_active).length
  const inactiveUsers = users.filter(u => !u.is_active).length
  const verifiedUsers = users.filter(u => u.email_verified).length
  const usersWithRole = users.filter(u => u.role_id).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie usuários do sistema
          </p>
        </div>
        <Button onClick={openCreateModal} disabled title="Criação temporariamente desabilitada. Use Registro na tela de login.">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              usuários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-mails Verificados</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">
              e-mails confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Papéis</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{usersWithRole}</div>
            <p className="text-xs text-muted-foreground">
              têm papéis definidos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={activeFilter} onValueChange={handleActiveFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={users}
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
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        description="Preencha os dados do usuário"
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const data: FormValues = {
              username: fd.get('username')?.toString(),
              email: fd.get('email')?.toString() || '',
              password: fd.get('password')?.toString() || undefined,
              first_name: fd.get('first_name')?.toString() || undefined,
              last_name: fd.get('last_name')?.toString() || undefined,
              role_id: fd.get('role_id')?.toString() || undefined,
              company_id: fd.get('company_id')?.toString() || undefined,
              is_active: fd.get('is_active')?.toString(),
              email_verified: fd.get('email_verified')?.toString(),
            }
            await handleSubmit(data as unknown as CreateUserData | UpdateUserData)
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome de Usuário</label>
              <Input
                name="username"
                placeholder="Ex: joaosilva"
                defaultValue={(defaultValues as any).username}
                required={!editingUser}
                disabled={!!editingUser}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                name="email"
                placeholder="usuario@exemplo.com"
                defaultValue={(defaultValues as any).email}
                required
              />
            </div>

            {!editingUser && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                name="first_name"
                placeholder="João"
                defaultValue={(defaultValues as any).first_name}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sobrenome</label>
              <Input
                name="last_name"
                placeholder="Silva"
                defaultValue={(defaultValues as any).last_name}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ID do Papel</label>
              <Input
                type="number"
                name="role_id"
                placeholder="ID do papel do usuário"
                defaultValue={(defaultValues as any).role_id}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ID da Empresa</label>
              <Input
                type="number"
                name="company_id"
                placeholder="ID da empresa"
                defaultValue={(defaultValues as any).company_id}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário Ativo</label>
              <input type="hidden" name="is_active" value={isActiveValue} />
              <Select value={isActiveValue} onValueChange={setIsActiveValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingUser && (
              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail Verificado</label>
                <input type="hidden" name="email_verified" value={emailVerifiedValue} />
                <Select value={emailVerifiedValue} onValueChange={setEmailVerifiedValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingUser ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </FormModal>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {selectedUser.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome Completo</label>
                  <div className="mt-1 text-sm">{getFullName(selectedUser)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedUser.is_active ? (
                      <UserCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <UserX className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={selectedUser.is_active ? 'default' : 'secondary'}>
                      {selectedUser.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">E-mail Verificado</label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.email_verified ? 'default' : 'secondary'}>
                      {selectedUser.email_verified ? 'Verificado' : 'Não Verificado'}
                    </Badge>
                  </div>
                </div>

                {selectedUser.role_id && (
                  <div>
                    <label className="text-sm font-medium">Papel</label>
                    <div className="mt-1">
                      <Badge variant="outline">ID: {selectedUser.role_id}</Badge>
                    </div>
                  </div>
                )}

                {selectedUser.company_id && (
                  <div>
                    <label className="text-sm font-medium">Empresa</label>
                    <div className="mt-1">
                      <Badge variant="outline">ID: {selectedUser.company_id}</Badge>
                    </div>
                  </div>
                )}

                {selectedUser.company && (
                  <div>
                    <label className="text-sm font-medium">Empresa</label>
                    <div className="mt-1 text-sm">
                      {`${selectedUser.company.name} (ID: ${selectedUser.company.id})`}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Criado em</label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedUser.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Atualizado em</label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedUser.updated_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}