'use client'

import { useState, useEffect } from 'react'
import { useUserRoleStore } from '@/store/userRole'
import { useRoleStore } from '@/store/role'
import { useUserStore } from '@/store/user'
import { DataTable } from '@/components/tables/DataTable'
import { FormModal } from '@/components/modals/FormModal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  UserRoleDetailed, 
  CreateUserRoleData, 
  TableColumn 
} from '@/types'
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus, 
  Crown,
  Link as LinkIcon,
  Search,
  Filter
} from 'lucide-react'

export default function UserRolesPage() {
  const {
    userRoles,
    loading: urLoading,
    pagination,
    filters,
    fetchUserRoles,
    fetchUserRolesByUser,
    fetchUserRolesByRole,
    createUserRole,
    deleteUserRole,
    setFilters
  } = useUserRoleStore()

  const { roles, fetchRoles } = useRoleStore()
  const { users, fetchUsers } = useUserStore()

  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'by-user' | 'by-role'>('list')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState<CreateUserRoleData>({
    user_id: 0,
    role_id: 0
  })

  const loading = urLoading

  useEffect(() => {
    fetchUserRoles()
    fetchRoles({ limit: 100 }) // Backend aceita no máximo 100 por página
    fetchUsers({ limit: 100 }) // Backend aceita no máximo 100 por página
  }, [fetchUserRoles, fetchRoles, fetchUsers])

  useEffect(() => {
    if (selectedUserId) {
      fetchUserRolesByUser(selectedUserId)
    }
  }, [selectedUserId, fetchUserRolesByUser])

  useEffect(() => {
    if (selectedRoleId) {
      fetchUserRolesByRole(selectedRoleId)
    }
  }, [selectedRoleId, fetchUserRolesByRole])

  const resetForm = () => {
    setFormData({
      user_id: 0,
      role_id: 0
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createUserRole(formData)
      closeModal()
      fetchUserRoles(filters)
      
      // Refresh specific views if they are active
      if (activeTab === 'by-user' && selectedUserId) {
        fetchUserRolesByUser(selectedUserId)
      }
      if (activeTab === 'by-role' && selectedRoleId) {
        fetchUserRolesByRole(selectedRoleId)
      }
    } catch {
      // Error já tratado no store
    }
  }

  const handleDelete = async (userRole: UserRoleDetailed) => {
    const userName = userRole.user_name || `ID: ${userRole.user_id}`
    const roleName = userRole.role_name || `ID: ${userRole.role_id}`
    
    if (!confirm(`Tem certeza que deseja remover o papel "${roleName}" do usuário "${userName}"?`)) {
      return
    }

    try {
      await deleteUserRole(userRole.id!)
      fetchUserRoles(filters)
      
      // Refresh specific views if they are active
      if (activeTab === 'by-user' && selectedUserId) {
        fetchUserRolesByUser(selectedUserId)
      }
      if (activeTab === 'by-role' && selectedRoleId) {
        fetchUserRolesByRole(selectedRoleId)
      }
    } catch {
      // Error já tratado no store
    }
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    fetchUserRoles({ ...filters, page })
  }

  const columns: TableColumn<UserRoleDetailed>[] = [
    {
      key: 'user_name',
      title: 'Usuário',
      render: (ur) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          <div>
            <div className="font-medium">
              {ur.user_name || `ID: ${ur.user_id}`}
            </div>
            {ur.user_email && (
              <div className="text-xs text-gray-500">{ur.user_email}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'role_name',
      title: 'Papel',
      render: (ur) => (
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-600" />
          <div>
            <div className="font-medium">
              {ur.role_name || `ID: ${ur.role_id}`}
            </div>
            {ur.role_description && (
              <div className="text-xs text-gray-500 max-w-xs truncate">
                {ur.role_description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Atribuído em',
      render: (ur) => new Date(ur.created_at).toLocaleDateString('pt-BR')
    }
  ]

  // Filter functions
  const filteredUsers = users.filter(user => 
    !searchTerm || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRoles = roles.filter(role =>
    !searchTerm ||
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Get role counts by user
  const usersByRoleCount = filteredUsers.map(user => {
    const roleCount = userRoles.filter(ur => ur.user_id === user.id).length
    const userRolesList = userRoles.filter(ur => ur.user_id === user.id)
    return { ...user, roleCount, userRoles: userRolesList }
  }).sort((a, b) => b.roleCount - a.roleCount)

  // Get user counts by role
  const rolesByUserCount = filteredRoles.map(role => {
    const userCount = userRoles.filter(ur => ur.role_id === role.id).length
    const roleUsersList = userRoles.filter(ur => ur.role_id === role.id)
    return { ...role, userCount, roleUsers: roleUsersList }
  }).sort((a, b) => b.userCount - a.userCount)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-purple-600" />
            Usuários e Papéis
          </h1>
          <p className="text-gray-600">
            Gerencie as atribuições de papéis aos usuários do sistema
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'by-user' | 'by-role')}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Lista de Atribuições
          </TabsTrigger>
          <TabsTrigger value="by-user" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Por Usuário
          </TabsTrigger>
          <TabsTrigger value="by-role" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Por Papel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <DataTable
            data={userRoles}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onAdd={openCreateModal}
            onDelete={handleDelete}
            title="Atribuições Usuário-Papel"
            description={`${pagination?.total || 0} atribuição(ões) ativa(s)`}
            addButtonText="Nova Atribuição"
            showSearch={false}
          />
        </TabsContent>

        <TabsContent value="by-user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Buscar usuários</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Nome, email ou username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atribuição
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {usersByRoleCount.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.username
                          }
                        </CardTitle>
                        <CardDescription>
                          {user.email} • @{user.username}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {user.roleCount} papéis
                      </Badge>
                      <Badge variant={user.is_active ? 'default' : 'outline'}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {user.roleCount > 0 && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.userRoles.slice(0, 3).map((ur) => (
                        <div key={ur.id} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            {ur.role_name}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(ur)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {user.roleCount > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.roleCount - 3} mais
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-role" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Buscar papéis</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Nome ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atribuição
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {rolesByUserCount.map((role) => (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <CardDescription>
                          {role.description || 'Sem descrição'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {role.userCount} usuários
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {role.userCount > 0 && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {role.roleUsers.slice(0, 3).map((ru) => (
                        <div key={ru.id} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {ru.user_name || ru.user_email || `ID: ${ru.user_id}`}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(ru)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {role.userCount > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.userCount - 3} mais
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <FormModal
        open={showModal}
        onClose={closeModal}
        title="Nova Atribuição"
        description="Atribua um papel a um usuário"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="user_id">Usuário *</Label>
              <Select 
                value={formData.user_id.toString()} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, user_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.username
                          }
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role_id">Papel *</Label>
              <Select 
                value={formData.role_id.toString()} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, role_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.name}</span>
                        {role.description && (
                          <span className="text-xs text-gray-500">
                            {role.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Criar Atribuição
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}