'use client'

import { useEffect, useState } from 'react'
import { useSettingStore } from '@/store/setting'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormModal } from '@/components/modals/FormModal'
import { Plus, Search, Settings, Code, Type, ToggleLeft } from 'lucide-react'
import { Setting, CreateSettingData, UpdateSettingData, SettingType } from '@/types'

export default function SettingsPage() {
  const { 
    settings, 
    selectedSetting,
    loading, 
    filters, 
    pagination,
    fetchSettings, 
    createSetting, 
    updateSetting, 
    deleteSetting,
    setSelectedSetting,
    setFilters 
  } = useSettingStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<SettingType | 'all'>('all')
  const [formData, setFormData] = useState<{
    key: string
    value: string
    type: SettingType
    description: string
  }>({ key: '', value: '', type: 'string', description: '' })

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, page: 1 }
    if (query) {
      newFilters.key = query
    } else {
      delete newFilters.key
    }
    setFilters(newFilters)
    fetchSettings(newFilters)
  }

  const handleTypeFilter = (type: SettingType | 'all') => {
    setTypeFilter(type)
    const newFilters = { ...filters, page: 1 }
    if (type !== 'all') {
      newFilters.type = type
    } else {
      delete newFilters.type
    }
    setFilters(newFilters)
    fetchSettings(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchSettings(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchSettings(newFilters)
  }

  const openCreateModal = () => {
    setEditingSetting(null)
    setFormData({ key: '', value: '', type: 'string', description: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (setting: Setting) => {
    setEditingSetting(setting)
    setFormData({
      key: setting.key || '',
      value: setting.value || '',
      type: setting.type || 'string',
      description: setting.description || ''
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSetting(null)
  }

  const handleSubmit = async (data: CreateSettingData | UpdateSettingData) => {
    try {
      if (editingSetting) {
        await updateSetting(editingSetting.id, data as UpdateSettingData)
      } else {
        await createSetting(data as CreateSettingData)
      }
      closeModal()
      fetchSettings(filters)
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      throw error
    }
  }

  const handleDelete = async (setting: Setting) => {
    if (window.confirm(`Tem certeza que deseja excluir a configuração "${setting.key}"?`)) {
      try {
        await deleteSetting(setting.id)
        fetchSettings(filters)
      } catch (error) {
        console.error('Erro ao excluir configuração:', error)
      }
    }
  }

  const handleView = (setting: Setting) => {
    setSelectedSetting(setting)
  }

  const getTypeColor = (type: SettingType) => {
    const colors = {
      'string': 'bg-blue-100 text-blue-800',
      'number': 'bg-green-100 text-green-800',
      'boolean': 'bg-purple-100 text-purple-800',
      'json': 'bg-orange-100 text-orange-800'
    }
    
    return colors[type]
  }

  const getTypeIcon = (type: SettingType) => {
    const icons = {
      'string': Type,
      'number': Code,
      'boolean': ToggleLeft,
      'json': Settings
    }
    
    return icons[type]
  }

  const formatValue = (value: string, type: SettingType) => {
    if (type === 'json') {
      try {
        return JSON.stringify(JSON.parse(value), null, 2)
      } catch {
        return value
      }
    }
    return value
  }

  const columns = [
    {
      key: 'key' as keyof Setting,
      title: 'Chave',
      sortable: true,
      render: (setting: Setting) => (
        <div className="font-mono text-sm font-medium">
          {setting.key}
        </div>
      )
    },
    {
      key: 'value' as keyof Setting,
      title: 'Valor',
      sortable: false,
      render: (setting: Setting) => (
        <div className="max-w-xs">
          {setting.type === 'json' ? (
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              JSON ({JSON.stringify(JSON.parse(setting.value || '{}')).length} chars)
            </code>
          ) : (
            <div className="truncate" title={setting.value}>
              {setting.value}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type' as keyof Setting,
      title: 'Tipo',
      sortable: true,
      render: (setting: Setting) => {
        const TypeIcon = getTypeIcon(setting.type)
        return (
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4" />
            <Badge className={getTypeColor(setting.type)}>
              {setting.type}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'description' as keyof Setting,
      title: 'Descrição',
      sortable: false,
      render: (setting: Setting) => (
        <div className="max-w-sm">
          {setting.description ? (
            <div className="text-sm text-muted-foreground truncate" title={setting.description}>
              {setting.description}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'updated_at' as keyof Setting,
      title: 'Atualizado em',
      sortable: true,
      render: (setting: Setting) => 
        new Date(setting.updated_at).toLocaleDateString('pt-BR')
    }
  ]

  // campos renderizados manualmente no conteúdo do modal

  // Calcular estatísticas
  const stringCount = settings.filter(s => s.type === 'string').length
  const numberCount = settings.filter(s => s.type === 'number').length
  const booleanCount = settings.filter(s => s.type === 'boolean').length
  const jsonCount = settings.filter(s => s.type === 'json').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie configurações do sistema (chave-valor)
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              configurações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">String</CardTitle>
            <Type className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stringCount}</div>
            <p className="text-xs text-muted-foreground">
              valores de texto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boolean</CardTitle>
            <ToggleLeft className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{booleanCount}</div>
            <p className="text-xs text-muted-foreground">
              valores true/false
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">JSON</CardTitle>
            <Code className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{jsonCount}</div>
            <p className="text-xs text-muted-foreground">
              objetos complexos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por chave..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={typeFilter} onValueChange={handleTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={settings}
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
        title={editingSetting ? 'Editar Configuração' : 'Nova Configuração'}
        description="Preencha os dados da configuração"
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (editingSetting) {
              const payload: UpdateSettingData = {
                value: formData.value,
                type: formData.type,
                description: formData.description || ''
              }
              await handleSubmit(payload)
            } else {
              const payload: CreateSettingData = {
                key: formData.key,
                value: formData.value,
                type: formData.type,
                description: formData.description || ''
              }
              await handleSubmit(payload)
            }
          }}
        >
          <div>
            <label className="text-sm font-medium">Chave</label>
            <Input
              value={formData.key}
              onChange={(e) => setFormData((p) => ({ ...p, key: e.target.value }))}
              placeholder="Ex: app_theme"
              required
              disabled={!!editingSetting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Valor</label>
            <Input
              value={formData.value}
              onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
              placeholder="Valor da configuração..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <Select value={formData.type} onValueChange={(v: SettingType) => setFormData((p) => ({ ...p, type: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String (Texto)</SelectItem>
                <SelectItem value="number">Number (Número)</SelectItem>
                <SelectItem value="boolean">Boolean (true/false)</SelectItem>
                <SelectItem value="json">JSON (Objeto)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Descrição da configuração..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{editingSetting ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </FormModal>

      {selectedSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {selectedSetting.key}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedSetting.description}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSetting(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Chave:</label>
                  <div className="mt-1">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {selectedSetting.key}
                    </code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Tipo:</label>
                  <div className="mt-1 flex items-center gap-2">
                    {(() => {
                      const TypeIcon = getTypeIcon(selectedSetting.type)
                      return <TypeIcon className="h-4 w-4" />
                    })()}
                    <Badge className={getTypeColor(selectedSetting.type)}>
                      {selectedSetting.type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Valor:</label>
                  <div className="mt-2 p-4 border rounded-md bg-gray-50">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {formatValue(selectedSetting.value, selectedSetting.type)}
                    </pre>
                  </div>
                </div>

                {selectedSetting.description && (
                  <div>
                    <label className="text-sm font-medium">Descrição:</label>
                    <div className="mt-1 text-sm">{selectedSetting.description}</div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Criado em:</label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedSetting.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Atualizado em:</label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedSetting.updated_at).toLocaleString('pt-BR')}
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