'use client'

import { useState, useEffect } from 'react'
import { useRolePermissionStore } from '@/store/rolePermission'
import { useRoleStore } from '@/store/role'
import { usePermissionStore } from '@/store/permission'
import { DataTable } from '@/components/tables/DataTable'
import { FormModal } from '@/components/modals/FormModal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  RolePermissionDetailed, 
  CreateRolePermissionData, 
  SetRolePermissionsData, 
  TableColumn 
} from '@/types'
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Settings, 
  Key, 
  Crown,
  Link as LinkIcon,
  Users
} from 'lucide-react'

export default function RolePermissionsPage() {
  const {
    rolePermissions,
    loading: rpLoading,
    pagination,
    filters,
    fetchRolePermissions,
    fetchRolePermissionsByRole,
    createRolePermission,
    setRolePermissions,
    deleteRolePermission,
    setFilters
  } = useRolePermissionStore()

  const { roles, fetchRoles } = useRoleStore()
  const { permissions, fetchPermissions } = usePermissionStore()

  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<'list' | 'manage'>('list')
  
  const [formData, setFormData] = useState<CreateRolePermissionData>({
    role_id: 0,
    permission_id: 0
  })

  const loading = rpLoading

  useEffect(() => {
    fetchRolePermissions()
    fetchRoles({ limit: 100 }) // Backend aceita no máximo 100 por página
    fetchPermissions({ limit: 100 }) // Backend aceita no máximo 100 por página
  }, [fetchRolePermissions, fetchRoles, fetchPermissions])

  const resetForm = () => {
    setFormData({
      role_id: 0,
      permission_id: 0
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openBulkModal = (roleId: number) => {
    setSelectedRoleId(roleId)
    // Buscar permissões atuais do role
    const currentPermissions = rolePermissions
      .filter(rp => rp.role_id === roleId)
      .map(rp => rp.permission_id)
    setSelectedPermissionIds(currentPermissions)
    setShowBulkModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const closeBulkModal = () => {
    setShowBulkModal(false)
    setSelectedRoleId(null)
    setSelectedPermissionIds([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createRolePermission(formData)
      closeModal()
      fetchRolePermissions(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRoleId) return

    try {
      await setRolePermissions(selectedRoleId, {
        permission_ids: selectedPermissionIds
      })
      closeBulkModal()
      fetchRolePermissions(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleDelete = async (rolePermission: RolePermissionDetailed) => {
    if (!confirm(`Tem certeza que deseja remover a permissão "${rolePermission.permission_name}" do papel "${rolePermission.role_name}"?`)) {
      return
    }

    try {
      await deleteRolePermission(rolePermission.id!)
      fetchRolePermissions(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    fetchRolePermissions({ ...filters, page })
  }

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const columns: TableColumn<RolePermissionDetailed>[] = [
    {
      key: 'role_name',
      title: 'Papel',
      render: (rp) => (
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-600" />
          <span className="font-medium">{rp.role_name}</span>
        </div>
      )
    },
    {
      key: 'permission_name',
      title: 'Permissão',
      render: (rp) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{rp.permission_name}</span>
        </div>
      )
    },
    {
      key: 'permission_resource',
      title: 'Recurso',
      render: (rp) => (
        <Badge variant="secondary">
          {rp.permission_resource}
        </Badge>
      )
    },
    {
      key: 'permission_action',
      title: 'Ação',
      render: (rp) => (
        <Badge variant="outline">
          {rp.permission_action}
        </Badge>
      )
    },
    {
      key: 'created_at',
      title: 'Vinculado em',
      render: (rp) => new Date(rp.created_at).toLocaleDateString('pt-BR')
    }
  ]

  const rolesByPermissionCount = roles.map(role => {
    const permissionCount = rolePermissions.filter(rp => rp.role_id === role.id).length
    return { ...role, permissionCount }
  }).sort((a, b) => b.permissionCount - a.permissionCount)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-green-600" />
            Papéis e Permissões
          </h1>
          <p className="text-gray-600">
            Gerencie as associações entre papéis e suas permissões
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'manage')}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Lista de Associações
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar por Papel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <DataTable
            data={rolePermissions}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onAdd={openCreateModal}
            onDelete={handleDelete}
            title="Associações Papel-Permissão"
            description={`${pagination?.total || 0} associação(ões) ativa(s)`}
            addButtonText="Nova Associação"
            showSearch={false}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-4">
            {rolesByPermissionCount.map((role) => (
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
                        {role.permissionCount} permissões
                      </Badge>
                      <Button
                        onClick={() => openBulkModal(role.id)}
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar Permissões
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {role.permissionCount > 0 && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {rolePermissions
                        .filter(rp => rp.role_id === role.id)
                        .slice(0, 5)
                        .map((rp) => (
                          <Badge key={rp.id} variant="outline" className="text-xs">
                            {rp.permission_name}
                          </Badge>
                        ))
                      }
                      {role.permissionCount > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissionCount - 5} mais
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

      {/* Create Association Modal */}
      <FormModal
        open={showModal}
        onClose={closeModal}
        title="Nova Associação"
        description="Associe uma permissão a um papel"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
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
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="permission_id">Permissão *</Label>
              <Select 
                value={formData.permission_id.toString()} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, permission_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma permissão" />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map(permission => (
                    <SelectItem key={permission.id} value={permission.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{permission.name}</span>
                        <span className="text-xs text-gray-500">
                          {permission.resource}:{permission.action}
                        </span>
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
              Criar Associação
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Bulk Manage Modal */}
      <FormModal
        open={showBulkModal}
        onClose={closeBulkModal}
        title={`Gerenciar Permissões: ${roles.find(r => r.id === selectedRoleId)?.name}`}
        description="Selecione as permissões que este papel deve ter"
        size="lg"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="max-h-96 overflow-y-auto border rounded-md p-4">
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissionIds.includes(permission.id)}
                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`permission-${permission.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Key className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{permission.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {permission.resource}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {permission.action}
                        </Badge>
                      </div>
                    </Label>
                    {permission.description && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {permission.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              {selectedPermissionIds.length} de {permissions.length} permissões selecionadas
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeBulkModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Salvar Permissões
              </Button>
            </div>
          </div>
        </form>
      </FormModal>
    </div>
  )
}