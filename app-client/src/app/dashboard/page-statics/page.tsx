'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePageStaticStore, PageStatic, CreatePageStaticData, UpdatePageStaticData } from '@/store/pageStatic'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
// import { HtmlEditorField } from '@/components/forms/HtmlEditorField'
// import { MetadataField } from '@/components/forms/MetadataField'
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  EyeOff, 
  Copy, 
  Edit,
  Trash2,
  // Power,
  // PowerOff
} from 'lucide-react'

export default function PageStaticsPage() {
  const { 
    pageStatics, 
    selectedPageStatic,
    loading, 
    filters, 
    pagination,
    fetchPageStatics, 
    createPageStatic, 
    updatePageStatic, 
    deletePageStatic,
    activatePageStatic,
    deactivatePageStatic,
    duplicatePageStatic,
    setSelectedPageStatic,
    setFilters 
  } = usePageStaticStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create')

  useEffect(() => {
    fetchPageStatics()
  }, [filters, pagination.page])

  const handleCreate = () => {
    setSelectedPageStatic(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (pageStatic: PageStatic) => {
    setSelectedPageStatic(pageStatic)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDuplicate = (pageStatic: PageStatic) => {
    setSelectedPageStatic(pageStatic)
    setModalMode('duplicate')
    setIsModalOpen(true)
  }

  const handleDelete = async (pageStatic: PageStatic) => {
    if (window.confirm(`Tem certeza que deseja remover a página "${pageStatic.title}"?`)) {
      await deletePageStatic(pageStatic.id)
    }
  }

  const handleToggleActive = async (pageStatic: PageStatic) => {
    if (pageStatic.is_active) {
      await deactivatePageStatic(pageStatic.id)
    } else {
      await activatePageStatic(pageStatic.id)
    }
  }

  const handleSubmit = async (data: CreatePageStaticData | UpdatePageStaticData) => {
    try {
      if (modalMode === 'create') {
        await createPageStatic(data as CreatePageStaticData)
      } else if (modalMode === 'edit') {
        await updatePageStatic(selectedPageStatic!.id, data)
      } else if (modalMode === 'duplicate') {
        const { newKey, newTitle, ...duplicateData } = data as any
        await duplicatePageStatic(selectedPageStatic!.id, newKey, newTitle)
      }
      setIsModalOpen(false)
    } catch (error) {
      // Error is handled in store
    }
  }

  const columns = [
    {
      key: 'key' as keyof PageStatic,
      title: 'Key',
      render: (pageStatic: PageStatic) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {pageStatic.key}
        </code>
      )
    },
    {
      key: 'title' as keyof PageStatic,
      title: 'Título',
      render: (pageStatic: PageStatic) => (
        <div className="font-medium">{pageStatic.title}</div>
      )
    },
    {
      key: 'type' as keyof PageStatic,
      title: 'Tipo',
      render: (pageStatic: PageStatic) => {
        const typeLabels = {
          page: 'Página',
          section: 'Seção',
          banner: 'Banner',
          config: 'Config'
        }
        const typeColors = {
          page: 'bg-blue-100 text-blue-800',
          section: 'bg-green-100 text-green-800',
          banner: 'bg-purple-100 text-purple-800',
          config: 'bg-gray-100 text-gray-800'
        }
        return (
          <Badge className={typeColors[pageStatic.type as keyof typeof typeColors]}>
            {typeLabels[pageStatic.type as keyof typeof typeLabels]}
          </Badge>
        )
      }
    },
    {
      key: 'is_active' as keyof PageStatic,
      title: 'Status',
      render: (pageStatic: PageStatic) => (
        <Badge variant={pageStatic.is_active ? "default" : "secondary"}>
          {pageStatic.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'order' as keyof PageStatic,
      title: 'Ordem',
      render: (pageStatic: PageStatic) => (
        <div className="text-center">{pageStatic.order || '-'}</div>
      )
    },
    {
      key: 'updated_at' as keyof PageStatic,
      title: 'Atualizado em',
      render: (pageStatic: PageStatic) => (
        <div className="text-sm text-gray-500">
          {pageStatic.updated_at ? new Date(pageStatic.updated_at).toLocaleDateString('pt-BR') : '-'}
        </div>
      )
    },
    {
      key: 'id' as keyof PageStatic,
      title: 'Ações',
      render: (pageStatic: PageStatic) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(pageStatic)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDuplicate(pageStatic)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleActive(pageStatic)}
          >
            {pageStatic.is_active ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(pageStatic)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create': return 'Nova Página Estática'
      case 'edit': return 'Editar Página Estática'
      case 'duplicate': return 'Duplicar Página Estática'
      default: return 'Página Estática'
    }
  }

  const formFields = useMemo(() => {
    const baseFields = [
      {
        name: 'key',
        label: 'Key',
        type: 'text' as const,
        required: true,
        placeholder: 'ex: hero-banner, about-section',
        description: 'Identificador único (apenas letras minúsculas, números, - e _)',
        defaultValue: modalMode === 'duplicate' ? '' : selectedPageStatic?.key || ''
      },
      {
        name: 'title',
        label: 'Título',
        type: 'text' as const,
        required: true,
        placeholder: 'Título da página/seção',
        defaultValue: modalMode === 'duplicate' ? '' : selectedPageStatic?.title || ''
      },
      {
        name: 'type',
        label: 'Tipo',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'page', label: 'Página' },
          { value: 'section', label: 'Seção' },
          { value: 'banner', label: 'Banner' },
          { value: 'config', label: 'Configuração' }
        ],
        defaultValue: selectedPageStatic?.type || 'page'
      },
      {
        name: 'content',
        label: 'Conteúdo',
        type: 'textarea' as const,
        placeholder: 'Conteúdo HTML/Markdown da página',
        rows: 6,
        defaultValue: selectedPageStatic?.content || ''
      },
      {
        name: 'order',
        label: 'Ordem',
        type: 'number' as const,
        placeholder: '0',
        description: 'Ordem de exibição (menor número = primeiro)',
        defaultValue: selectedPageStatic?.order || 0
      },
      {
        name: 'is_active',
        label: 'Ativo',
        type: 'checkbox' as const,
        defaultValue: selectedPageStatic?.is_active !== false
      }
    ]

    if (modalMode === 'duplicate') {
      baseFields[0].name = 'newKey'
      baseFields[0].label = 'Nova Key'
      baseFields[1].name = 'newTitle'
      baseFields[1].label = 'Novo Título'
    }

    return baseFields
  }, [modalMode, selectedPageStatic])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Páginas Estáticas</h1>
          <p className="text-gray-600">Gerencie conteúdo estático do site</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Página
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar por título, key ou conteúdo..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ search: e.target.value || undefined })}
              />
            </div>
            <div>
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => setFilters({ type: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="page">Página</SelectItem>
                  <SelectItem value="section">Seção</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="config">Configuração</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select 
                value={filters.isActive === undefined ? 'all' : filters.isActive.toString()} 
                onValueChange={(value) => setFilters({ 
                  isActive: value === 'all' ? undefined : value === 'true' 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pageStatics.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <EyeOff className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pageStatics.filter(p => !p.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Páginas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pageStatics.filter(p => p.type === 'page').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Páginas Estáticas ({pagination.total})
          </CardTitle>
          <CardDescription>
            Lista de todas as páginas estáticas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={pageStatics}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={getModalTitle()}
        fields={formFields}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}