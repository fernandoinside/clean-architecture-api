'use client'

import { useState, useEffect } from 'react'
import { usePermissionStore } from '@/store/permission'
import { DataTable } from '@/components/tables/DataTable'
import { FormModal } from '@/components/modals/FormModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Permission, CreatePermissionData, TableColumn } from '@/types'
import { Shield, Plus, Edit, Trash2, Key } from 'lucide-react'

type PermissionFormData = CreatePermissionData

export default function PermissionsPage() {
  const {
    permissions,
    loading,
    pagination,
    filters,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    setFilters
  } = usePermissionStore()

  const [showModal, setShowModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [formData, setFormData] = useState<CreatePermissionData>({
    name: '',
    resource: '',
    action: '',
    description: ''
  })

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const resetForm = () => {
    setFormData({
      name: '',
      resource: '',
      action: '',
      description: ''
    })
    setEditingPermission(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (permission: Permission) => {
    setFormData({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || ''
    })
    setEditingPermission(permission)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingPermission) {
        await updatePermission(editingPermission.id, formData)
      } else {
        await createPermission(formData)
      }
      closeModal()
      fetchPermissions(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleDelete = async (permission: Permission) => {
    if (!confirm(`Tem certeza que deseja excluir a permissão "${permission.name}"?`)) {
      return
    }

    try {
      await deletePermission(permission.id)
      fetchPermissions(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 })
    fetchPermissions({ ...filters, search, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    fetchPermissions({ ...filters, page })
  }

  const handleChange = (field: keyof PermissionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const columns: TableColumn<Permission>[] = [
    {
      key: 'name',
      title: 'Nome',
      sortable: true,
      render: (permission) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{permission.name}</span>
        </div>
      )
    },
    {
      key: 'resource',
      title: 'Recurso',
      render: (permission) => (
        <Badge variant="secondary">
          {permission.resource}
        </Badge>
      )
    },
    {
      key: 'action',
      title: 'Ação',
      render: (permission) => (
        <Badge variant="outline">
          {permission.action}
        </Badge>
      )
    },
    {
      key: 'description',
      title: 'Descrição',
      render: (permission) => (
        <span className="text-sm text-gray-600 max-w-xs truncate">
          {permission.description || '-'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Criado em',
      sortable: true,
      render: (permission) => new Date(permission.created_at).toLocaleDateString('pt-BR')
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Permissões
          </h1>
          <p className="text-gray-600">
            Gerencie as permissões do sistema e controle de acesso
          </p>
        </div>
      </div>

      <DataTable
        data={permissions}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        title="Lista de Permissões"
        description={`${pagination?.total || 0} permissão(ões) cadastrada(s)`}
        searchPlaceholder="Buscar por nome, recurso ou ação..."
        addButtonText="Nova Permissão"
      />

      <FormModal
        open={showModal}
        onClose={closeModal}
        title={editingPermission ? 'Editar Permissão' : 'Nova Permissão'}
        description={editingPermission ? 'Altere os dados da permissão' : 'Cadastre uma nova permissão no sistema'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome da Permissão *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: user:create, company:read"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato recomendado: recurso:ação (ex: user:create, company:read)
              </p>
            </div>

            <div>
              <Label htmlFor="resource">Recurso *</Label>
              <Input
                id="resource"
                value={formData.resource}
                onChange={(e) => handleChange('resource', e.target.value)}
                placeholder="Ex: user, company, customer"
                required
              />
            </div>

            <div>
              <Label htmlFor="action">Ação *</Label>
              <Input
                id="action"
                value={formData.action}
                onChange={(e) => handleChange('action', e.target.value)}
                placeholder="Ex: create, read, update, delete"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva o que esta permissão permite fazer"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingPermission ? 'Salvar Alterações' : 'Criar Permissão'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}