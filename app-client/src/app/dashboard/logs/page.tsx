'use client'

import { useState, useEffect } from 'react'
import { useLogStore } from '@/store/log'
import { DataTable } from '@/components/tables/DataTable'
import { FormModal } from '@/components/modals/FormModal'
import { MetadataField } from '@/components/forms/MetadataField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Log, CreateLogData, TableColumn, LogLevel, LogSource } from '@/types'
import { 
  ScrollText, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Bug,
  Eye,
  Calendar,
  Filter
} from 'lucide-react'

type LogFormData = CreateLogData

const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case 'error':
      return <AlertCircle className="h-4 w-4" />
    case 'warn':
      return <AlertTriangle className="h-4 w-4" />
    case 'info':
      return <Info className="h-4 w-4" />
    case 'debug':
      return <Bug className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

const getLevelColor = (level: LogLevel) => {
  switch (level) {
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'warn':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'debug':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function LogsPage() {
  const {
    logs,
    loading,
    pagination,
    filters,
    fetchLogs,
    createLog,
    updateLog,
    deleteLog,
    setFilters
  } = useLogStore()

  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [viewingLog, setViewingLog] = useState<Log | null>(null)
  const [formData, setFormData] = useState<CreateLogData>({
    level: 'info',
    message: '',
    meta: undefined,
    source: 'frontend'
  })

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Calculate stats locally from logs
  const stats = {
    info: logs.filter(log => log.level === 'info').length,
    warn: logs.filter(log => log.level === 'warn').length,
    error: logs.filter(log => log.level === 'error').length,
    debug: logs.filter(log => log.level === 'debug').length,
  }

  const resetForm = () => {
    setFormData({
      level: 'info',
      message: '',
      meta: undefined,
      source: 'frontend'
    })
    setEditingLog(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (log: Log) => {
    setFormData({
      level: log.level,
      message: log.message,
      meta: log.meta,
      source: log.source || 'frontend'
    })
    setEditingLog(log)
    setShowModal(true)
  }

  const openViewModal = (log: Log) => {
    setViewingLog(log)
    setShowViewModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setViewingLog(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingLog) {
        await updateLog(editingLog.id, formData)
      } else {
        await createLog(formData)
      }
      closeModal()
      fetchLogs(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleDelete = async (log: Log) => {
    if (!confirm('Tem certeza que deseja excluir este log?')) {
      return
    }

    try {
      await deleteLog(log.id)
      fetchLogs(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleSearch = (search: string) => {
    setFilters({ ...filters, message: search, page: 1 })
    fetchLogs({ ...filters, message: search, page: 1 })
  }

  const handleLevelFilter = (level: LogLevel | 'all') => {
    const newFilters = { ...filters, page: 1 }
    if (level === 'all') {
      delete newFilters.level
    } else {
      newFilters.level = level
    }
    setFilters(newFilters)
    fetchLogs(newFilters)
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    fetchLogs({ ...filters, page })
  }

  const handleChange = (field: keyof LogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const columns: TableColumn<Log>[] = [
    {
      key: 'level',
      title: 'Nível',
      render: (log) => (
        <Badge className={`${getLevelColor(log.level)} font-medium`}>
          <div className="flex items-center gap-1">
            {getLevelIcon(log.level)}
            {log.level.toUpperCase()}
          </div>
        </Badge>
      )
    },
    {
      key: 'message',
      title: 'Mensagem',
      render: (log) => (
        <div className="max-w-md">
          <span className="font-medium text-sm">{log.message}</span>
        </div>
      )
    },
    {
      key: 'source',
      title: 'Origem',
      render: (log) => (
        <Badge variant={log.source === 'backend' ? 'default' : 'secondary'}>
          {log.source}
        </Badge>
      )
    },
    {
      key: 'created_at',
      title: 'Data/Hora',
      sortable: true,
      render: (log) => (
        <div className="text-sm">
          <div>{new Date(log.created_at).toLocaleDateString('pt-BR')}</div>
          <div className="text-gray-500">{new Date(log.created_at).toLocaleTimeString('pt-BR')}</div>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-purple-600" />
            Logs do Sistema
          </h1>
          <p className="text-gray-600">
            Monitore e gerencie os registros de atividades do sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warn}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Bug className="h-4 w-4 text-gray-600" />
                Debug
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.debug}</div>
            </CardContent>
          </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!filters.level ? "default" : "outline"}
              size="sm"
              onClick={() => handleLevelFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={filters.level === 'info' ? "default" : "outline"}
              size="sm"
              onClick={() => handleLevelFilter('info')}
              className="text-blue-600"
            >
              <Info className="h-4 w-4 mr-1" />
              Info
            </Button>
            <Button
              variant={filters.level === 'warn' ? "default" : "outline"}
              size="sm"
              onClick={() => handleLevelFilter('warn')}
              className="text-yellow-600"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Warning
            </Button>
            <Button
              variant={filters.level === 'error' ? "default" : "outline"}
              size="sm"
              onClick={() => handleLevelFilter('error')}
              className="text-red-600"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Error
            </Button>
            <Button
              variant={filters.level === 'debug' ? "default" : "outline"}
              size="sm"
              onClick={() => handleLevelFilter('debug')}
              className="text-gray-600"
            >
              <Bug className="h-4 w-4 mr-1" />
              Debug
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={logs}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onAdd={openCreateModal}
        onEdit={openEditModal}
        onView={openViewModal}
        onDelete={handleDelete}
        title="Lista de Logs"
        description={`${pagination?.total || 0} log(s) registrado(s)`}
        searchPlaceholder="Buscar na mensagem..."
        addButtonText="Novo Log"
      />

      {/* Create/Edit Modal */}
      <FormModal
        open={showModal}
        onClose={closeModal}
        title={editingLog ? 'Editar Log' : 'Novo Log'}
        description={editingLog ? 'Altere os dados do log' : 'Registre um novo log no sistema'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level">Nível *</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value: LogLevel) => handleChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source">Origem *</Label>
              <Select 
                value={formData.source} 
                onValueChange={(value: LogSource) => handleChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="message">Mensagem *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Descreva o evento ou erro registrado"
                required
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <MetadataField
                value={formData.meta}
                onChange={(value: Record<string, any> | null) => handleChange('meta', value)}
                label="Metadados"
                description="Dados adicionais em formato JSON"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingLog ? 'Salvar Alterações' : 'Registrar Log'}
            </Button>
          </div>
        </form>
      </FormModal>

      {/* View Modal */}
      <FormModal
        open={showViewModal}
        onClose={closeViewModal}
        title="Detalhes do Log"
        description="Visualização completa do registro de log"
        size="lg"
      >
        {viewingLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nível</Label>
                <div className="mt-1">
                  <Badge className={`${getLevelColor(viewingLog.level)} font-medium`}>
                    <div className="flex items-center gap-1">
                      {getLevelIcon(viewingLog.level)}
                      {viewingLog.level.toUpperCase()}
                    </div>
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Origem</Label>
                <div className="mt-1">
                  <Badge variant={viewingLog.source === 'backend' ? 'default' : 'secondary'}>
                    {viewingLog.source}
                  </Badge>
                </div>
              </div>

              <div className="col-span-2">
                <Label>Mensagem</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{viewingLog.message}</p>
                </div>
              </div>

              {viewingLog.meta && (
                <div className="col-span-2">
                  <Label>Metadados</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(viewingLog.meta, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <Label>Criado em</Label>
                <div className="mt-1 text-sm text-gray-600">
                  {new Date(viewingLog.created_at).toLocaleString('pt-BR')}
                </div>
              </div>

              <div>
                <Label>ID</Label>
                <div className="mt-1 text-sm text-gray-600">
                  {viewingLog.id}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={closeViewModal}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}