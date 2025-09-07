'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CardPaymentProps, CardData, CardValidation } from '@/types/checkout'
import { CreditCard, Lock, AlertCircle } from 'lucide-react'

export function CardPayment({ 
  onSubmit, 
  loading = false, 
  error 
}: CardPaymentProps) {
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    holder_name: '',
    exp_month: '',
    exp_year: '',
    cvv: ''
  })
  
  const [validation, setValidation] = useState<CardValidation>({
    number: { isValid: true },
    expiry: { isValid: true },
    cvv: { isValid: true },
    holderName: { isValid: true }
  })

  // Validação do número do cartão (algoritmo de Luhn)
  const validateCardNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, '')
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false

    let sum = 0
    let isEven = false

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // Detectar bandeira do cartão
  const getCardBrand = (number: string): string => {
    const cleanNumber = number.replace(/\D/g, '')
    
    if (cleanNumber.match(/^4/)) return 'visa'
    if (cleanNumber.match(/^5[1-5]/)) return 'mastercard'
    if (cleanNumber.match(/^3[47]/)) return 'amex'
    if (cleanNumber.match(/^6/)) return 'discover'
    
    return 'unknown'
  }

  // Formatar número do cartão
  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '')
    const groups = cleanValue.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleanValue
  }

  // Formatar data de expiração
  const formatExpiry = (value: string): { month: string; year: string } => {
    const cleanValue = value.replace(/\D/g, '')
    let month = cleanValue.slice(0, 2)
    let year = cleanValue.slice(2, 6)

    // Validar mês
    if (month.length === 2) {
      const monthNum = parseInt(month)
      if (monthNum < 1) month = '01'
      if (monthNum > 12) month = '12'
    }

    // Adicionar século se necessário
    if (year.length === 2) {
      const currentYear = new Date().getFullYear()
      const currentCentury = Math.floor(currentYear / 100) * 100
      year = (currentCentury + parseInt(year)).toString()
    }

    return { month, year }
  }

  // Validar data de expiração
  const validateExpiry = (month: string, year: string): boolean => {
    if (!month || !year) return false
    
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    if (monthNum < 1 || monthNum > 12) return false
    if (yearNum < currentYear) return false
    if (yearNum === currentYear && monthNum < currentMonth) return false

    return true
  }

  // Handlers
  const handleCardNumberChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 19)
    const formattedValue = formatCardNumber(cleanValue)
    
    setCardData(prev => ({ ...prev, number: formattedValue }))
    
    // Validar
    const isValid = validateCardNumber(cleanValue)
    setValidation(prev => ({
      ...prev,
      number: {
        isValid,
        message: isValid ? undefined : 'Número do cartão inválido'
      }
    }))
  }

  const handleExpiryChange = (field: 'exp_month' | 'exp_year', value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    setCardData(prev => ({ ...prev, [field]: cleanValue }))
    
    // Validar quando ambos os campos estiverem preenchidos
    const month = field === 'exp_month' ? cleanValue : cardData.exp_month
    const year = field === 'exp_year' ? cleanValue : cardData.exp_year
    
    if (month && year) {
      const isValid = validateExpiry(month.padStart(2, '0'), year)
      setValidation(prev => ({
        ...prev,
        expiry: {
          isValid,
          message: isValid ? undefined : 'Data de expiração inválida'
        }
      }))
    }
  }

  const handleCvvChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 4)
    setCardData(prev => ({ ...prev, cvv: cleanValue }))
    
    const isValid = cleanValue.length >= 3
    setValidation(prev => ({
      ...prev,
      cvv: {
        isValid,
        message: isValid ? undefined : 'CVV deve ter pelo menos 3 dígitos'
      }
    }))
  }

  const handleHolderNameChange = (value: string) => {
    const cleanValue = value.toUpperCase().replace(/[^A-Z\s]/g, '')
    setCardData(prev => ({ ...prev, holder_name: cleanValue }))
    
    const isValid = cleanValue.trim().length >= 2
    setValidation(prev => ({
      ...prev,
      holderName: {
        isValid,
        message: isValid ? undefined : 'Nome deve ter pelo menos 2 caracteres'
      }
    }))
  }

  const isFormValid = (): boolean => {
    return (
      validation.number.isValid &&
      validation.expiry.isValid &&
      validation.cvv.isValid &&
      validation.holderName.isValid &&
      cardData.number.length >= 13 &&
      cardData.exp_month.length >= 1 &&
      cardData.exp_year.length >= 4 &&
      cardData.cvv.length >= 3 &&
      cardData.holder_name.length >= 2
    )
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return

    const submitData: CardData = {
      number: cardData.number.replace(/\s/g, ''),
      holder_name: cardData.holder_name,
      exp_month: cardData.exp_month.padStart(2, '0'),
      exp_year: cardData.exp_year,
      cvv: cardData.cvv
    }

    await onSubmit(submitData)
  }

  const cardBrand = getCardBrand(cardData.number)

  return (
    <div className="space-y-4">
      {/* Número do cartão */}
      <div>
        <Label htmlFor="card_number">Número do Cartão *</Label>
        <div className="relative">
          <Input
            id="card_number"
            value={cardData.number}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            placeholder="1234 5678 9012 3456"
            className={`pr-12 ${!validation.number.isValid ? 'border-red-500' : ''}`}
            maxLength={23}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {cardBrand === 'visa' && (
              <span className="text-blue-600 font-bold text-sm">VISA</span>
            )}
            {cardBrand === 'mastercard' && (
              <span className="text-red-600 font-bold text-sm">MASTER</span>
            )}
            {cardBrand === 'amex' && (
              <span className="text-blue-800 font-bold text-sm">AMEX</span>
            )}
            {cardBrand === 'unknown' && cardData.number && (
              <CreditCard className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        {!validation.number.isValid && (
          <p className="text-sm text-red-500 mt-1">{validation.number.message}</p>
        )}
      </div>

      {/* Nome no cartão */}
      <div>
        <Label htmlFor="holder_name">Nome no Cartão *</Label>
        <Input
          id="holder_name"
          value={cardData.holder_name}
          onChange={(e) => handleHolderNameChange(e.target.value)}
          placeholder="NOME COMO NO CARTÃO"
          className={!validation.holderName.isValid ? 'border-red-500' : ''}
        />
        {!validation.holderName.isValid && (
          <p className="text-sm text-red-500 mt-1">{validation.holderName.message}</p>
        )}
      </div>

      {/* Data de expiração e CVV */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="exp_month">Mês *</Label>
          <Input
            id="exp_month"
            value={cardData.exp_month}
            onChange={(e) => handleExpiryChange('exp_month', e.target.value)}
            placeholder="12"
            maxLength={2}
            className={!validation.expiry.isValid ? 'border-red-500' : ''}
          />
        </div>
        <div>
          <Label htmlFor="exp_year">Ano *</Label>
          <Input
            id="exp_year"
            value={cardData.exp_year}
            onChange={(e) => handleExpiryChange('exp_year', e.target.value)}
            placeholder="2025"
            maxLength={4}
            className={!validation.expiry.isValid ? 'border-red-500' : ''}
          />
        </div>
        <div>
          <Label htmlFor="cvv">CVV *</Label>
          <div className="relative">
            <Input
              id="cvv"
              type="password"
              value={cardData.cvv}
              onChange={(e) => handleCvvChange(e.target.value)}
              placeholder="123"
              maxLength={4}
              className={`pr-8 ${!validation.cvv.isValid ? 'border-red-500' : ''}`}
            />
            <Lock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      {(!validation.expiry.isValid || !validation.cvv.isValid) && (
        <div className="text-sm text-red-500">
          {!validation.expiry.isValid && <p>{validation.expiry.message}</p>}
          {!validation.cvv.isValid && <p>{validation.cvv.message}</p>}
        </div>
      )}

      {/* Informação de segurança */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Seus dados são protegidos com criptografia SSL de 256 bits
            </span>
          </div>
        </AlertDescription>
      </Alert>

      {/* Erro */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Botão de pagamento */}
      <Button
        onClick={handleSubmit}
        disabled={!isFormValid() || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pagar com Cartão
          </>
        )}
      </Button>
    </div>
  )
}