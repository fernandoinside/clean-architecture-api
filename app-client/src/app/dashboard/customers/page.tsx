'use client'

import { useState, useEffect } from 'react'
import { useCustomerStore } from '@/store/customer'
import { useCompanyStore } from '@/store/company'
import { DataTable } from '@/components/tables/DataTable'
import { FormModal } from '@/components/modals/FormModal'
import { MetadataField } from '@/components/forms/MetadataField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Customer, 
  CreateCustomerData, 
  UpdateCustomerData,
  CustomerAddress,
  CreateCustomerAddressData,
  UpdateCustomerAddressData,
  TableColumn 
} from '@/types'
import { Users, MapPin, Plus, Edit, Eye, Trash2, Star, StarOff } from 'lucide-react'

type CustomerFormData = CreateCustomerData
type AddressFormData = CreateCustomerAddressData

export default function CustomersPage() {
  const {
    customers,
    selectedCustomer,
    addresses,
    loading,
    pagination,
    filters,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setSelectedCustomer,
    fetchCustomerAddresses,
    createCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    setDefaultAddress,
    setFilters
  } = useCustomerStore()

  const { companies, fetchCompanies } = useCompanyStore()

  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
  const [activeTab, setActiveTab] = useState<'customers' | 'addresses'>('customers')

  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    company_id: 0,
    name: '',
    email: '',
    phone: '',
    document: '',
    status: 'active',
    metadata: undefined
  })

  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    customerId: 0,
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    type: 'both',
    isDefault: false,
    metadata: undefined
  })

  useEffect(() => {
    fetchCustomers()
    fetchCompanies()
  }, [fetchCustomers, fetchCompanies])

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerAddresses(selectedCustomer.id)
      setActiveTab('addresses')
    }
  }, [selectedCustomer, fetchCustomerAddresses])

  const resetCustomerForm = () => {
    setCustomerFormData({
      company_id: 0,
      name: '',
      email: '',
      phone: '',
      document: '',
      status: 'active',
      metadata: undefined
    })
    setEditingCustomer(null)
  }

  const resetAddressForm = () => {
    setAddressFormData({
      customerId: selectedCustomer?.id || 0,
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      type: 'both',
      isDefault: false,
      metadata: undefined
    })
    setEditingAddress(null)
  }

  const openCreateCustomerModal = () => {
    resetCustomerForm()
    setShowCustomerModal(true)
  }

  const openEditCustomerModal = (customer: Customer) => {
    setCustomerFormData({
      company_id: customer.company_id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      document: customer.document || '',
      status: customer.status,
      metadata: customer.metadata
    })
    setEditingCustomer(customer)
    setShowCustomerModal(true)
  }

  const openCreateAddressModal = () => {
    resetAddressForm()
    setShowAddressModal(true)
  }

  const openEditAddressModal = (address: CustomerAddress) => {
    setAddressFormData({
      customerId: address.customer_id,
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zip_code || '',
      country: address.country || '',
      type: address.type,
      isDefault: address.is_default,
      metadata: address.metadata
    })
    setEditingAddress(address)
    setShowAddressModal(true)
  }

  const closeCustomerModal = () => {
    setShowCustomerModal(false)
    resetCustomerForm()
  }

  const closeAddressModal = () => {
    setShowAddressModal(false)
    resetAddressForm()
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerFormData)
      } else {
        await createCustomer(customerFormData)
      }
      closeCustomerModal()
      fetchCustomers(filters)
    } catch {
      // Error já tratado no store
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingAddress) {
        await updateCustomerAddress(editingAddress.id, addressFormData)
      } else {
        await createCustomerAddress(addressFormData)
      }
      closeAddressModal()
      if (selectedCustomer) {
        fetchCustomerAddresses(selectedCustomer.id)
      }
    } catch {
      // Error já tratado no store
    }
  }

  const handleCustomerDelete = async (customer: Customer) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${customer.name}"?`)) {
      return
    }

    try {
      await deleteCustomer(customer.id)
      fetchCustomers(filters)
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null)
        setActiveTab('customers')
      }
    } catch {
      // Error já tratado no store
    }
  }

  const handleAddressDelete = async (address: CustomerAddress) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) {
      return
    }

    try {
      await deleteCustomerAddress(address.id)
      if (selectedCustomer) {
        fetchCustomerAddresses(selectedCustomer.id)
      }
    } catch {
      // Error já tratado no store
    }
  }

  const handleSetDefaultAddress = async (address: CustomerAddress) => {
    try {
      await setDefaultAddress(address.id, address.customer_id)
    } catch {
      // Error já tratado no store
    }
  }

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 })
    fetchCustomers({ ...filters, search, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    fetchCustomers({ ...filters, page })
  }

  const customerColumns: TableColumn<Customer>[] = [
    {
      key: 'name',
      title: 'Nome',
      sortable: true
    },
    {
      key: 'email',
      title: 'E-mail',
      sortable: true
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (customer) => customer.phone || '-'
    },
    {
      key: 'company_id',
      title: 'Empresa',
      render: (customer) => {
        const company = companies.find(c => c.id === customer.company_id)
        return company?.name || `ID: ${customer.company_id}`
      }
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

  const addressColumns: TableColumn<CustomerAddress>[] = [
    {
      key: 'street',
      title: 'Endereço',
      render: (address) => address.street || '-'
    },
    {
      key: 'city',
      title: 'Cidade',
      render: (address) => address.city || '-'
    },
    {
      key: 'state',
      title: 'Estado',
      render: (address) => address.state || '-'
    },
    {
      key: 'type',
      title: 'Tipo',
      render: (address) => {
        const typeLabels = {
          billing: 'Cobrança',
          shipping: 'Entrega',
          both: 'Ambos'
        }
        return typeLabels[address.type]
      }
    },
    {
      key: 'is_default',
      title: 'Padrão',
      render: (address) => (
        <div className="flex items-center">
          {address.is_default ? (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Padrão
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSetDefaultAddress(address)}
              className="text-gray-400 hover:text-yellow-600"
            >
              <StarOff className="h-3 w-3" />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">
            Gerencie clientes e seus endereços de forma integrada
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'customers' | 'addresses')}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2" disabled={!selectedCustomer}>
            <MapPin className="h-4 w-4" />
            Endereços
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <DataTable
            data={customers}
            columns={customerColumns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onAdd={openCreateCustomerModal}
            onEdit={openEditCustomerModal}
            onView={(customer) => {
              setSelectedCustomer(customer)
              setActiveTab('addresses')
            }}
            onDelete={handleCustomerDelete}
            title="Lista de Clientes"
            description={`${pagination?.total || 0} cliente(s) cadastrado(s)`}
            searchPlaceholder="Buscar por nome ou e-mail..."
            addButtonText="Novo Cliente"
          />
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          {selectedCustomer ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {selectedCustomer.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedCustomer.email} • Status: <Badge variant="secondary">{selectedCustomer.status}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab('customers')} variant="outline">
                    ← Voltar aos Clientes
                  </Button>
                </CardContent>
              </Card>

              <DataTable
                data={addresses}
                columns={addressColumns}
                loading={loading}
                onAdd={openCreateAddressModal}
                onEdit={openEditAddressModal}
                onDelete={handleAddressDelete}
                title="Endereços do Cliente"
                description={`${addresses.length} endereço(s) cadastrado(s)`}
                addButtonText="Novo Endereço"
                showSearch={false}
              />
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600">Selecione um cliente para ver seus endereços</p>
                <Button onClick={() => setActiveTab('customers')} className="mt-4">
                  Ver Clientes
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Cliente */}
      <FormModal
        open={showCustomerModal}
        onClose={closeCustomerModal}
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
        description={editingCustomer ? 'Altere os dados do cliente' : 'Cadastre um novo cliente no sistema'}
        size="lg"
      >
        <form onSubmit={handleCustomerSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="company_id">Empresa *</Label>
              <Select 
                value={customerFormData.company_id.toString()} 
                onValueChange={(value: string) => setCustomerFormData(prev => ({ ...prev, company_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="name">Nome do Cliente *</Label>
              <Input
                id="name"
                value={customerFormData.name}
                onChange={(e) => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={customerFormData.email}
                onChange={(e) => setCustomerFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="cliente@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={customerFormData.phone}
                onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="document">Documento</Label>
              <Input
                id="document"
                value={customerFormData.document}
                onChange={(e) => setCustomerFormData(prev => ({ ...prev, document: e.target.value }))}
                placeholder="CPF ou outro documento"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={customerFormData.status} 
                onValueChange={(value: string) => setCustomerFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <MetadataField
                value={customerFormData.metadata}
                onChange={(value: Record<string, any> | null) => setCustomerFormData(prev => ({ ...prev, metadata: value }))}
                label="Dados Adicionais"
                description="Campos personalizados em formato JSON"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeCustomerModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingCustomer ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Modal de Endereço */}
      <FormModal
        open={showAddressModal}
        onClose={closeAddressModal}
        title={editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
        description={editingAddress ? 'Altere os dados do endereço' : 'Cadastre um novo endereço para o cliente'}
      >
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="street">Endereço</Label>
              <Input
                id="street"
                value={addressFormData.street}
                onChange={(e) => setAddressFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={addressFormData.city}
                onChange={(e) => setAddressFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="São Paulo"
              />
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={addressFormData.state}
                onChange={(e) => setAddressFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="SP"
              />
            </div>

            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={addressFormData.zipCode}
                onChange={(e) => setAddressFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="01234-567"
              />
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={addressFormData.country}
                onChange={(e) => setAddressFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Brasil"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="type">Tipo de Endereço</Label>
              <Select 
                value={addressFormData.type} 
                onValueChange={(value: string) => setAddressFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Cobrança</SelectItem>
                  <SelectItem value="shipping">Entrega</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isDefault">Definir como endereço padrão</Label>
              </div>
            </div>

            <div className="col-span-2">
              <MetadataField
                value={addressFormData.metadata}
                onChange={(value: Record<string, any> | null) => setAddressFormData(prev => ({ ...prev, metadata: value }))}
                label="Dados Adicionais"
                description="Campos personalizados em formato JSON"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeAddressModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {editingAddress ? 'Salvar Alterações' : 'Criar Endereço'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  )
}