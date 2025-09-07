'use client'

import { useEffect, useState } from 'react'
import { useEmailTemplateStore } from '@/store/emailTemplate'
import { DataTable } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormModal } from '@/components/modals/FormModal'
import { Plus, Search, FileText } from 'lucide-react'
import { EmailTemplate, CreateEmailTemplateData, UpdateEmailTemplateData } from '@/types'
import { HtmlEditorField } from '@/components/forms/HtmlEditorField'

export default function EmailTemplatesPage() {
  const { 
    emailTemplates, 
    selectedEmailTemplate,
    loading, 
    filters, 
    pagination,
    fetchEmailTemplates, 
    createEmailTemplate, 
    updateEmailTemplate, 
    deleteEmailTemplate,
    setSelectedEmailTemplate,
    setFilters 
  } = useEmailTemplateStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState<{
    name: string
    subject: string
    type: string
    body: string
  }>({ name: '', subject: '', type: '', body: '' })

  useEffect(() => {
    fetchEmailTemplates()
  }, [fetchEmailTemplates])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, page: 1 }
    if (query) {
      newFilters.name = query
      newFilters.subject = query
    } else {
      delete newFilters.name
      delete newFilters.subject
    }
    setFilters(newFilters)
    fetchEmailTemplates(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchEmailTemplates(newFilters)
  }

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }
    setFilters(newFilters)
    fetchEmailTemplates(newFilters)
  }

  const openCreateModal = () => {
    setEditingTemplate(null)
    setFormData({ name: '', subject: '', type: '', body: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name || '',
      subject: template.subject || '',
      type: template.type || '',
      body: template.body || ''
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTemplate(null)
  }

  const handleSubmit = async (data: CreateEmailTemplateData | UpdateEmailTemplateData) => {
    try {
      if (editingTemplate) {
        await updateEmailTemplate(editingTemplate.id, data as UpdateEmailTemplateData)
      } else {
        await createEmailTemplate(data as CreateEmailTemplateData)
      }
      closeModal()
      fetchEmailTemplates(filters)
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      throw error
    }
  }

  const handleDelete = async (template: EmailTemplate) => {
    if (window.confirm('Tem certeza que deseja excluir este template de e-mail?')) {
      try {
        await deleteEmailTemplate(template.id)
        fetchEmailTemplates(filters)
      } catch (error) {
        console.error('Erro ao excluir template:', error)
      }
    }
  }

  const handleView = (template: EmailTemplate) => {
    setSelectedEmailTemplate(template)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'password_reset': 'bg-red-100 text-red-800',
      'welcome': 'bg-green-100 text-green-800',
      'notification': 'bg-blue-100 text-blue-800',
      'invoice': 'bg-purple-100 text-purple-800',
      'reminder': 'bg-yellow-100 text-yellow-800'
    } as Record<string, string>
    
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const columns = [
    {
      key: 'name' as keyof EmailTemplate,
      title: 'Nome',
      sortable: true,
      render: (template: EmailTemplate) => (
        <div className="font-medium">{template.name}</div>
      )
    },
    {
      key: 'subject' as keyof EmailTemplate,
      title: 'Assunto',
      sortable: true,
      render: (template: EmailTemplate) => (
        <div className="max-w-xs truncate" title={template.subject}>
          {template.subject}
        </div>
      )
    },
    {
      key: 'type' as keyof EmailTemplate,
      title: 'Tipo',
      sortable: true,
      render: (template: EmailTemplate) => (
        <Badge className={getTypeColor(template.type)}>
          {template.type}
        </Badge>
      )
    },
    {
      key: 'created_at' as keyof EmailTemplate,
      title: 'Criado em',
      sortable: true,
      render: (template: EmailTemplate) => 
        new Date(template.created_at).toLocaleDateString('pt-BR')
    }
  ]

  // campos agora renderizados manualmente no conteúdo do modal

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates de E-mail</h2>
          <p className="text-muted-foreground">
            Gerencie templates de e-mail para diferentes tipos de notificações
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              templates cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou assunto..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <DataTable
        data={emailTemplates}
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
        title={editingTemplate ? 'Editar Template' : 'Novo Template'}
        description="Preencha os dados do template de e-mail"
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const payload = formData
            await handleSubmit(payload as CreateEmailTemplateData)
          }}
        >
          <div>
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: redefinir_senha"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Assunto</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Ex: Redefinição de Senha"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <Input
              value={formData.type}
              onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
              placeholder="Ex: password_reset"
              required
            />
          </div>

          <div>
            <HtmlEditorField
              value={formData.body}
              onChange={(v) => setFormData((p) => ({ ...p, body: v }))}
              label="Conteúdo HTML"
              description="Conteúdo HTML do e-mail"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{editingTemplate ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </FormModal>

      {selectedEmailTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmailTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmailTemplate.subject}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEmailTemplate(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo:</label>
                  <div className="mt-1">
                    <Badge className={getTypeColor(selectedEmailTemplate.type)}>
                      {selectedEmailTemplate.type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Assunto:</label>
                  <div className="mt-1 text-sm">{selectedEmailTemplate.subject}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Conteúdo HTML:</label>
                  <div className="mt-2 p-4 border rounded-md bg-gray-50 max-h-64 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {selectedEmailTemplate.body}
                    </pre>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Preview:</label>
                  <div className="mt-2 border rounded-md bg-white p-4">
                    <div dangerouslySetInnerHTML={{ __html: selectedEmailTemplate.body }} />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Criado em:</label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedEmailTemplate.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Atualizado em:</label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedEmailTemplate.updated_at).toLocaleString('pt-BR')}
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