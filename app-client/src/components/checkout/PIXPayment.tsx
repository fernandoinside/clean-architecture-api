'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PIXPaymentProps } from '@/types/checkout'
import { QrCode, Copy, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useCheckout } from '@/store/checkout'

export function PIXPayment({ 
  payment, 
  onPaymentComplete, 
  onExpired 
}: PIXPaymentProps) {
  const checkout = useCheckout()
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [copySuccess, setCopySuccess] = useState(false)

  // Calcular tempo restante
  useEffect(() => {
    if (!payment.expires_at) return

    const calculateTimeLeft = () => {
      const expiresAt = new Date(payment.expires_at)
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()
      return Math.max(0, Math.floor(diff / 1000))
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        onExpired?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [payment.expires_at, onExpired])

  // Formatar tempo em MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Copiar código PIX
  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(payment.pix_qr_code)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  // Verificar status manualmente
  const checkStatus = async () => {
    try {
      await checkout.checkPaymentStatus(payment.transaction_id)
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-6 w-6" />
            Pagamento PIX
          </CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              R$ {payment.amount.toFixed(2)}
            </Badge>
            <Badge variant="outline">
              {payment.plan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status atual */}
          <div className="text-center">
            {checkout.paymentStatus?.status === 'completed' ? (
              <div className="text-green-600">
                <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="font-semibold">Pagamento Confirmado!</p>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura foi ativada com sucesso
                </p>
              </div>
            ) : timeLeft > 0 ? (
              <div className="text-blue-600">
                <Clock className="h-12 w-12 mx-auto mb-2" />
                <p className="font-semibold">Aguardando Pagamento</p>
                <p className="text-2xl font-mono font-bold text-orange-600 mt-2">
                  {formatTime(timeLeft)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tempo restante para pagamento
                </p>
              </div>
            ) : (
              <div className="text-red-600">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="font-semibold">PIX Expirado</p>
                <p className="text-sm text-muted-foreground">
                  O tempo limite para pagamento foi excedido
                </p>
              </div>
            )}
          </div>

          {/* QR Code */}
          {timeLeft > 0 && (
            <>
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg border">
                  {payment.pix_qr_code_url ? (
                    <img
                      src={payment.pix_qr_code_url}
                      alt="QR Code PIX"
                      className="w-48 h-48 mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Escaneie o QR Code com seu app bancário
                </p>
              </div>

              {/* Código PIX copiável */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ou copie e cole o código PIX:
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-50 rounded border text-sm font-mono break-all">
                    {payment.pix_qr_code}
                  </div>
                  <Button
                    onClick={copyPixCode}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    {copySuccess ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copySuccess && (
                  <p className="text-sm text-green-600">
                    Código copiado com sucesso!
                  </p>
                )}
              </div>

              {/* Instruções */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Como pagar com PIX:</p>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>Abra o app do seu banco</li>
                      <li>Acesse a área PIX</li>
                      <li>Escaneie o QR Code ou cole o código</li>
                      <li>Confirme o pagamento</li>
                      <li>Aguarde a confirmação automática</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Botão verificar status */}
              <div className="flex justify-center gap-2">
                <Button
                  onClick={checkStatus}
                  variant="outline"
                  disabled={checkout.isLoading}
                >
                  {checkout.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verificar Status
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Botão de ação baseado no status */}
          <div className="flex justify-center">
            {checkout.paymentStatus?.status === 'completed' ? (
              <Button onClick={() => onPaymentComplete?.()}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Continuar
              </Button>
            ) : timeLeft <= 0 ? (
              <Button onClick={() => checkout.reset()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar Novo PIX
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Informações adicionais */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Pagamento ID:</span>
              <p className="font-mono">{payment.payment_id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Transação:</span>
              <p className="font-mono text-xs">{payment.transaction_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}