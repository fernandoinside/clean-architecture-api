'use client'

import { useEffect, useState } from 'react'
import { useCheckout } from '@/store/checkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PIXPayment } from './PIXPayment'
import { CardPayment } from './CardPayment'
import { CheckoutFormProps, CustomerData, PaymentMethod, SubscriptionType } from '@/types/checkout'
import { CreditCard, QrCode, User, Building, AlertCircle, CheckCircle } from 'lucide-react'

export function CheckoutForm({ 
  planId, 
  subscriptionType, 
  entityId,
  onSuccess,
  onError 
}: CheckoutFormProps) {
  const checkout = useCheckout()
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    document: '',
    phone: {
      country_code: '55',
      area_code: '',
      number: ''
    },
    address: {
      street: '',
      street_number: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'BR'
    }
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')

  // Carregar configurações ao montar o componente
  useEffect(() => {
    checkout.loadConfig().catch(console.error)
  }, [])

  // Atualizar formData no store quando dados mudarem
  useEffect(() => {
    checkout.setFormData({
      plan_id: planId,
      subscription_type: subscriptionType,
      [subscriptionType === 'company' ? 'company_id' : 'customer_id']: entityId,
      customer_data: customerData,
      payment_method: paymentMethod
    })
  }, [planId, subscriptionType, entityId, customerData, paymentMethod])

  // Reset quando planId muda
  useEffect(() => {
    checkout.reset()
  }, [planId])

  const handleCustomerDataChange = (field: keyof CustomerData, value: any) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value
      }
    }))
  }

  const handlePhoneChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      phone: {
        ...prev.phone!,
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    try {
      const result = await checkout.submitCheckout()
      onSuccess?.(result)
    } catch (error: any) {
      onError?.(error.message)
    }
  }

  // Renderizar baseado no step atual
  if (checkout.step === 'processing') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Processando pagamento...</p>
            <p className="text-sm text-muted-foreground mt-2">
              {paymentMethod === 'pix' ? 'Gerando código PIX' : 'Processando cartão de crédito'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (checkout.step === 'pix_waiting' && checkout.currentPayment) {
    return (
      <PIXPayment 
        payment={checkout.currentPayment as any}
        onPaymentComplete={() => onSuccess?.(checkout.currentPayment!)}
        onExpired={() => {
          checkout.setError('PIX expirado')
          checkout.setStep('error')
        }}
      />
    )
  }

  if (checkout.step === 'success') {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-700 mb-2">Pagamento Confirmado!</h3>
          <p className="text-muted-foreground mb-4">
            Sua assinatura foi ativada com sucesso.
          </p>
          <Button onClick={checkout.reset}>
            Fazer Novo Pagamento
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (checkout.step === 'error') {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {checkout.error || 'Erro no processamento do pagamento'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button onClick={checkout.reset} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {subscriptionType === 'company' ? (
              <Building className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
            Dados do {subscriptionType === 'company' ? 'Responsável' : 'Cliente'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
              Dados Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => handleCustomerDataChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className="h-11"
                  required
                />
              </div>
            </div>
          </div>

          {/* Documento e Telefone */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
              Documento e Contato
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document" className="text-sm font-medium text-gray-700">
                  CPF/CNPJ *
                </Label>
                <Input
                  id="document"
                  value={customerData.document}
                  onChange={(e) => handleCustomerDataChange('document', e.target.value.replace(/\D/g, ''))}
                  placeholder="Apenas números"
                  maxLength={14}
                  className="h-11 font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_code" className="text-sm font-medium text-gray-700">
                  DDD *
                </Label>
                <Input
                  id="area_code"
                  value={customerData.phone?.area_code || ''}
                  onChange={(e) => handlePhoneChange('area_code', e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="11"
                  maxLength={2}
                  className="h-11 text-center font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  value={customerData.phone?.number || ''}
                  onChange={(e) => handlePhoneChange('number', e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="999999999"
                  maxLength={9}
                  className="h-11 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
              Endereço de Cobrança
            </h4>
            
            {/* Linha 1: Rua e Número */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                  Logradouro *
                </Label>
                <Input
                  id="street"
                  value={customerData.address?.street || ''}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Rua, Avenida, Travessa..."
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street_number" className="text-sm font-medium text-gray-700">
                  Número *
                </Label>
                <Input
                  id="street_number"
                  value={customerData.address?.street_number || ''}
                  onChange={(e) => handleAddressChange('street_number', e.target.value)}
                  placeholder="123"
                  className="h-11"
                  required
                />
              </div>
            </div>

            {/* Linha 2: Bairro e Cidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-sm font-medium text-gray-700">
                  Bairro *
                </Label>
                <Input
                  id="neighborhood"
                  value={customerData.address?.neighborhood || ''}
                  onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  Cidade *
                </Label>
                <Input
                  id="city"
                  value={customerData.address?.city || ''}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="Nome da cidade"
                  className="h-11"
                  required
                />
              </div>
            </div>

            {/* Linha 3: Estado e CEP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  Estado *
                </Label>
                <Input
                  id="state"
                  value={customerData.address?.state || ''}
                  onChange={(e) => handleAddressChange('state', e.target.value.slice(0, 2).toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  className="h-11 uppercase text-center font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700">
                  CEP *
                </Label>
                <Input
                  id="zip_code"
                  value={customerData.address?.zip_code || ''}
                  onChange={(e) => handleAddressChange('zip_code', e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678"
                  maxLength={8}
                  className="h-11 font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Método de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seletor de método de pagamento melhorado */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
              Escolha como deseja pagar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  paymentMethod === 'pix'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setPaymentMethod('pix')}
              >
                {paymentMethod === 'pix' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${paymentMethod === 'pix' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <QrCode className={`h-6 w-6 ${paymentMethod === 'pix' ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">PIX</h4>
                    <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                    <p className="text-xs text-gray-500 mt-1">Aprovação imediata • Sem taxas</p>
                  </div>
                </div>
              </div>

              <div
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  paymentMethod === 'credit_card'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => setPaymentMethod('credit_card')}
              >
                {paymentMethod === 'credit_card' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${paymentMethod === 'credit_card' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <CreditCard className={`h-6 w-6 ${paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cartão de Crédito</h4>
                    <p className="text-sm text-gray-600">Aprovação imediata</p>
                    <p className="text-xs text-gray-500 mt-1">Parcelamento disponível</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário do cartão */}
          {paymentMethod === 'credit_card' && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
                Dados do Cartão de Crédito
              </h4>
              <CardPayment
                onSubmit={async (cardData) => {
                  checkout.setFormData({ card_data: cardData })
                  await handleSubmit()
                }}
                loading={checkout.isLoading}
                error={checkout.error}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de envio para PIX */}
      {paymentMethod === 'pix' && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Finalizar com PIX
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pagamento aprovado na hora • Sem taxas extras
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                size="lg"
                disabled={!checkout.canSubmit() || checkout.isLoading}
                className="w-full md:w-auto min-w-[200px] h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {checkout.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5 mr-2" />
                    Gerar Código PIX
                  </>
                )}
              </Button>
              {!checkout.canSubmit() && (
                <p className="text-xs text-orange-600">
                  Preencha todos os campos obrigatórios para continuar
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro geral */}
      {checkout.hasError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {checkout.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}