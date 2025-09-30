'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { QrCode, CheckCircle, Clock, Copy, Loader2 } from 'lucide-react'
import Header from '@/components/Header'

interface PaymentStatus {
  paymentId: string
  status: string
  statusDescription: string
  amount: number
  order: {
    id: string
    status: string
    paymentStatus: string
    totalAmount: number
  }
}

export default function PixPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get('paymentId')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState('')
  const [pixCode, setPixCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutos

  useEffect(() => {
    if (!paymentId) {
      router.push('/cart')
      return
    }

    loadPaymentData()
    
    // Verificar status a cada 10 segundos
    const interval = setInterval(() => {
      checkPaymentStatus()
    }, 10000)

    // Timer de expiração
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [paymentId])

  const loadPaymentData = async () => {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentStatus(data)
        
        // Simular QR Code e código PIX (em produção, viria da API do Mercado Pago)
        setQrCode(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`)
        setPixCode(`00020126580014br.gov.bcb.pix0136${paymentId}520400005303986540${data.amount.toFixed(2)}5802BR5925PowerChip E-commerce6009SAO PAULO62070503***6304`)
      } else {
        toast.error('Erro ao carregar dados do pagamento')
        router.push('/cart')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do pagamento:', error)
      toast.error('Erro ao carregar dados do pagamento')
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!paymentId) return

    try {
      const response = await fetch(`/api/payments/status/${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentStatus(data)
        
        if (data.status === 'approved') {
          toast.success('Pagamento aprovado!')
          router.push(`/orders/${data.order.id}`)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    toast.success('Código PIX copiado!')
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!paymentStatus) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Pagamento não encontrado</p>
            <Button onClick={() => router.push('/cart')} className="mt-4">
              Voltar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <QrCode className="h-6 w-6" />
              <span>Pagamento via PIX</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {paymentStatus.status === 'approved' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-500" />
                )}
                <span className="text-lg font-medium">
                  {paymentStatus.statusDescription}
                </span>
              </div>
              
              {paymentStatus.status === 'pending' && (
                <div className="text-sm text-gray-600">
                  <p>Tempo restante: <span className="font-mono font-bold">{formatTime(timeLeft)}</span></p>
                  <p className="mt-1">O pagamento será verificado automaticamente</p>
                </div>
              )}
            </div>

            {/* Valor */}
            <div className="text-center bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Valor a pagar</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {paymentStatus.amount.toFixed(2)}
              </p>
            </div>

            {/* QR Code */}
            {paymentStatus.status === 'pending' && (
              <>
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                      <QrCode className="h-24 w-24 text-gray-400" />
                      <span className="sr-only">QR Code do PIX</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Escaneie o QR Code com o app do seu banco
                  </p>
                </div>

                {/* Código PIX */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ou copie o código PIX:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={pixCode}
                      readOnly
                      className="flex-1 p-3 border rounded-lg bg-gray-50 text-sm font-mono"
                    />
                    <Button onClick={copyPixCode} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Instruções */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Como pagar:</h3>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Abra o app do seu banco</li>
                    <li>2. Escolha a opção PIX</li>
                    <li>3. Escaneie o QR Code ou cole o código</li>
                    <li>4. Confirme o pagamento</li>
                    <li>5. Pronto! O pagamento será processado automaticamente</li>
                  </ol>
                </div>
              </>
            )}

            {/* Botões */}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/orders')}
                className="flex-1"
              >
                Ver Meus Pedidos
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Continuar Comprando
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}