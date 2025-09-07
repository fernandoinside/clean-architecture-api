'use client'

import { useState, useEffect } from 'react'
import { useCompanyStore } from '@/store/company'
import { DataTable } from '@/components/tables/DataTable'
import { FormModal } from '@/components/modals/FormModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Company, CreateCompanyData, UpdateCompanyData, TableColumn } from '@/types'
import { Building2, Plus, Edit, Trash2 } from 'lucide-react'

type CompanyFormData = CreateCompanyData

export default function CompaniesPage() {
  const {
    companies,
    loading,
    pagination,
    filters,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    setFilters
  } = useCompanyStore()

  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    email: '',
    phone: '',
    document: '',
    website: '',
    industry: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      document: '',
      website: '',
      industry: '',
      status: 'active'
    })
    setEditingCompany(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (company: Company) => {
    setFormData({
      name: company.name,
      email: company.email || '',
      phone: company.phone || '',
      document: company.document || '',
      website: company.website || '',
      industry: company.industry || '',
      status: company.status
    })
    setEditingCompany(company)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, formData)
      } else {
        await createCompany(formData)
      }
      closeModal()
      fetchCompanies(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleDelete = async (company: Company) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
      return
    }

    try {
      await deleteCompany(company.id)
      fetchCompanies(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 })
    fetchCompanies({ ...filters, search, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    fetchCompanies({ ...filters, page })
  }

  const handleChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const columns: TableColumn<Company>[] = [
    {
      key: 'name',
      title: 'Nome',
      sortable: true
    },
    {
      key: 'email',
      title: 'E-mail',
      render: (company) => company.email || '-'
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (company) => company.phone || '-'
    },   
    {
      key: 'status',
      title: 'Status',
      sortable: true
    },
    {
      key: 'created_at',
      title: 'Criado em',
      sortable: true
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
      </div>

      <DataTable
        data={companies}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        title="Lista de Empresas"
        description={`${pagination?.total || 0} empresa(s) cadastrada(s)`}
        searchPlaceholder="Buscar por nome, e-mail ou cidade..."
        addButtonText="Nova Empresa"
      />

      <FormModal
        open={showModal}
        onClose={closeModal}
        title={editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
        description={editingCompany ? 'Altere os dados da empresa' : 'Cadastre uma nova empresa no sistema'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome da empresa"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="document">CNPJ *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleChange('document', e.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="industry">Ramo de Atividade</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="Ex: Tecnologia, Saúde, Educação"
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingCompany ? 'Salvar Alterações' : 'Criar Empresa'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}