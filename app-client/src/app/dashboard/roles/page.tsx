'use client'

import { useState, useEffect } from 'react'
import { useRoleStore } from '@/store/role'
import { DataTable } from '@/components/tables/DataTable'
import { FormModal } from '@/components/modals/FormModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Role, CreateRoleData, TableColumn } from '@/types'
import { UserCheck, Plus, Edit, Trash2, Crown } from 'lucide-react'

type RoleFormData = CreateRoleData

export default function RolesPage() {
  const {
    roles,
    loading,
    pagination,
    filters,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    setFilters
  } = useRoleStore()

  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    })
    setEditingRole(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description || ''
    })
    setEditingRole(role)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData)
      } else {
        await createRole(formData)
      }
      closeModal()
      fetchRoles(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleDelete = async (role: Role) => {
    if (!confirm(`Tem certeza que deseja excluir o papel "${role.name}"?`)) {
      return
    }

    try {
      await deleteRole(role.id)
      fetchRoles(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 })
    fetchRoles({ ...filters, search, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    fetchRoles({ ...filters, page })
  }

  const handleChange = (field: keyof RoleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const columns: TableColumn<Role>[] = [
    {
      key: 'name',
      title: 'Nome do Papel',
      sortable: true,
      render: (role) => (
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-600" />
          <span className="font-medium">{role.name}</span>
        </div>
      )
    },
    {
      key: 'description',
      title: 'Descrição',
      render: (role) => (
        <span className="text-sm text-gray-600 max-w-md">
          {role.description || '-'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Criado em',
      sortable: true,
      render: (role) => new Date(role.created_at).toLocaleDateString('pt-BR')
    },
    {
      key: 'updated_at',
      title: 'Atualizado em',
      sortable: true,
      render: (role) => new Date(role.updated_at).toLocaleDateString('pt-BR')
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-yellow-600" />
            Papéis de Usuário
          </h1>
          <p className="text-gray-600">
            Gerencie os papéis e níveis de acesso do sistema
          </p>
        </div>
      </div>

      <DataTable
        data={roles}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        title="Lista de Papéis"
        description={`${pagination?.total || 0} papel(éis) cadastrado(s)`}
        searchPlaceholder="Buscar por nome ou descrição..."
        addButtonText="Novo Papel"
      />

      <FormModal
        open={showModal}
        onClose={closeModal}
        title={editingRole ? 'Editar Papel' : 'Novo Papel'}
        description={editingRole ? 'Altere os dados do papel' : 'Cadastre um novo papel no sistema'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Papel *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: admin, manager, user"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome único que identifica o papel no sistema
              </p>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva as responsabilidades e acesso deste papel"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Descrição detalhada das funções e acessos do papel
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingRole ? 'Salvar Alterações' : 'Criar Papel'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}