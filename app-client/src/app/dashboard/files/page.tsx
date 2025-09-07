'use client'

import { useEffect, useState, useRef } from 'react'
import { useFileStore } from '@/store/file'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MetadataField } from '@/components/forms/MetadataField'
import { Plus, Search, FileText, Upload, Download, FolderOpen } from 'lucide-react'
import { File, FileEntityType } from '@/types'

export default function FilesPage() {
  const { 
    files, 
    selectedFile,
    loading, 
    filters, 
    pagination,
    fetchFiles, 
    uploadFile, 
    updateFile, 
    deleteFile,
    setSelectedFile,
    setFilters 
  } = useFileStore()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState<FileEntityType | 'all'>('all')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, page: 1 }
    if (query) {
      newFilters.filename = query
      newFilters.original_name = query
    } else {
      delete newFilters.filename
      delete newFilters.original_name
    }
    setFilters(newFilters)
    fetchFiles(newFilters)
  }

  const handleEntityTypeFilter = (entityType: FileEntityType | 'all') => {
    setEntityTypeFilter(entityType)
    const newFilters = { ...filters, page: 1 }
    if (entityType !== 'all') {
      newFilters.entity_type = entityType
    } else {
      delete newFilters.entity_type
    }
    setFilters(newFilters)
    fetchFiles(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchFiles(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchFiles(newFilters)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      await uploadFile(formData)
      
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        fetchFiles(filters)
      }, 500)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openUploadDialog = () => {
    fileInputRef.current?.click()
  }

  const handleDelete = async (file: File) => {
    if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
      try {
        await deleteFile(file.id)
        fetchFiles(filters)
      } catch (error) {
        console.error('Erro ao excluir arquivo:', error)
      }
    }
  }

  const handleView = (file: File) => {
    setSelectedFile(file)
  }

  const handleDownload = (file: File) => {
    // In a real implementation, this would download the file from the server
    const link = document.createElement('a')
    link.href = file.path
    link.download = file.original_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800'
    if (mimeType.includes('pdf')) return 'bg-red-100 text-red-800'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'bg-blue-100 text-blue-800'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-emerald-100 text-emerald-800'
    if (mimeType.startsWith('video/')) return 'bg-purple-100 text-purple-800'
    if (mimeType.startsWith('audio/')) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getEntityTypeColor = (entityType?: string) => {
    const colors = {
      'user': 'bg-blue-100 text-blue-800',
      'company': 'bg-purple-100 text-purple-800',
      'customer': 'bg-green-100 text-green-800',
      'subscription': 'bg-yellow-100 text-yellow-800',
      'plan': 'bg-orange-100 text-orange-800',
      'payment': 'bg-red-100 text-red-800'
    } as Record<string, string>
    
    return entityType ? colors[entityType] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
  }

  const columns = [
    {
      key: 'original_name' as keyof File,
      title: 'Nome do Arquivo',
      sortable: true,
      render: (file: File) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{file.original_name}</div>
            <div className="text-sm text-muted-foreground">{file.filename}</div>
          </div>
        </div>
      )
    },
    {
      key: 'mime_type' as keyof File,
      title: 'Tipo',
      sortable: true,
      render: (file: File) => (
        <Badge className={getFileTypeColor(file.mime_type)}>
          {file.mime_type}
        </Badge>
      )
    },
    {
      key: 'size' as keyof File,
      title: 'Tamanho',
      sortable: true,
      render: (file: File) => formatFileSize(file.size)
    },
    {
      key: 'entity_type' as keyof File,
      title: 'Entidade',
      sortable: true,
      render: (file: File) => file.entity_type ? (
        <Badge className={getEntityTypeColor(file.entity_type)}>
          {file.entity_type}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
    {
      key: 'created_at' as keyof File,
      title: 'Upload em',
      sortable: true,
      render: (file: File) => 
        new Date(file.created_at).toLocaleDateString('pt-BR')
    }
  ]

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Arquivos</h2>
          <p className="text-muted-foreground">
            Gerencie arquivos e uploads do sistema
          </p>
        </div>
        <Button onClick={openUploadDialog} disabled={isUploading}>
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Enviando...' : 'Upload'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Arquivos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              arquivos no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espaço Usado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              total armazenado
            </p>
          </CardContent>
        </Card>
      </div>

      {isUploading && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Enviando arquivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={entityTypeFilter} onValueChange={handleEntityTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as entidades</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="company">Empresa</SelectItem>
            <SelectItem value="customer">Cliente</SelectItem>
            <SelectItem value="subscription">Assinatura</SelectItem>
            <SelectItem value="plan">Plano</SelectItem>
            <SelectItem value="payment">Pagamento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={files}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onDelete={handleDelete}
        onView={handleView}
        customActions={(file: File) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(file)}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      />

      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedFile.original_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedFile.filename}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <MetadataField 
                  label="Tipo de Arquivo" 
                  value={
                    <Badge className={getFileTypeColor(selectedFile.mime_type)}>
                      {selectedFile.mime_type}
                    </Badge>
                  } 
                />
                
                <MetadataField label="Tamanho" value={formatFileSize(selectedFile.size)} />
                
                {selectedFile.entity_type && (
                  <MetadataField 
                    label="Entidade Associada" 
                    value={
                      <div className="flex items-center gap-2">
                        <Badge className={getEntityTypeColor(selectedFile.entity_type)}>
                          {selectedFile.entity_type}
                        </Badge>
                        {selectedFile.entity_id && (
                          <span className="text-sm text-muted-foreground">
                            ID: {selectedFile.entity_id}
                          </span>
                        )}
                      </div>
                    } 
                  />
                )}
                
                <MetadataField label="Caminho" value={selectedFile.path} />
                
                {selectedFile.metadata && (
                  <div>
                    <label className="text-sm font-medium">Metadados:</label>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-md text-sm overflow-auto">
                      {JSON.stringify(selectedFile.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                
                <MetadataField 
                  label="Upload em" 
                  value={new Date(selectedFile.created_at).toLocaleString('pt-BR')} 
                />
                
                <MetadataField 
                  label="Atualizado em" 
                  value={new Date(selectedFile.updated_at).toLocaleString('pt-BR')} 
                />
                
                <div className="flex gap-2">
                  <Button onClick={() => handleDownload(selectedFile)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        multiple={false}
      />
    </div>
  )
}