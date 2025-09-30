'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CreditCard, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
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

export default function CardPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get('paymentId')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!paymentId) {
      router.push('/cart')
      return
    }

    loadPaymentData()
    
    // Verificar status a cada 5 segundos (cartão processa mais rápido)
    const interval = setInterval(() => {
      checkPaymentStatus()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [paymentId])

  const loadPaymentData = async () => {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentStatus(data)
        
        // Se já foi aprovado ou rejeitado, parar de verificar
        if (data.status === 'approved' || data.status === 'rejected') {
          setProcessing(false)
        } else {
          setProcessing(true)
        }
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
          setProcessing(false)
          toast.success('Pagamento aprovado!')
          setTimeout(() => {
            router.push(`/orders/${data.order.id}`)
          }, 2000)
        } else if (data.status === 'rejected') {
          setProcessing(false)
          toast.error('Pagamento rejeitado')
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  const tryAgain = () => {
    router.push('/checkout')
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
              <CreditCard className="h-6 w-6" />
              <span>Pagamento via Cartão</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                {paymentStatus.status === 'approved' ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : paymentStatus.status === 'rejected' ? (
                  <XCircle className="h-12 w-12 text-red-500" />
                ) : processing ? (
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="h-12 w-12 text-yellow-500" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {paymentStatus.status === 'approved' && 'Pagamento Aprovado!'}
                {paymentStatus.status === 'rejected' && 'Pagamento Rejeitado'}
                {paymentStatus.status === 'pending' && processing && 'Processando Pagamento...'}
                {paymentStatus.status === 'pending' && !processing && 'Aguardando Processamento'}
              </h2>
              
              <p className="text-gray-600">
                {paymentStatus.statusDescription}
              </p>
            </div>

            {/* Valor */}
            <div className="text-center bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Valor processado</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {paymentStatus.amount.toFixed(2)}
              </p>
            </div>

            {/* Mensagens específicas por status */}
            {paymentStatus.status === 'approved' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Pagamento Confirmado</h3>
                    <p className="text-sm text-green-800">
                      Seu pagamento foi processado com sucesso! Você receberá um email de confirmação 
                      e seu pedido já está sendo preparado para envio.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus.status === 'rejected' && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900">Pagamento Não Autorizado</h3>
                    <p className="text-sm text-red-800 mb-3">
                      O pagamento não foi aprovado. Isso pode acontecer por diversos motivos:
                    </p>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Dados do cartão incorretos</li>
                      <li>• Limite insuficiente</li>
                      <li>• Cartão bloqueado ou vencido</li>
                      <li>• Problemas na operadora</li>
                    </ul>
                    <p className="text-sm text-red-800 mt-3">
                      Verifique os dados e tente novamente ou use outro método de pagamento.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus.status === 'pending' && processing && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 animate-spin" />
                  <div>
                    <h3 className="font-medium text-blue-900">Processando...</h3>
                    <p className="text-sm text-blue-800">
                      Estamos processando seu pagamento. Isso pode levar alguns segundos.
                      Por favor, não feche esta página.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus.status === 'pending' && !processing && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Aguardando Confirmação</h3>
                    <p className="text-sm text-yellow-800">
                      Seu pagamento está sendo analisado pela operadora do cartão.
                      Você receberá uma notificação assim que for processado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Informações do Pedido */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Informações do Pedido</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Pedido:</strong> #{paymentStatus.order.id}</p>
                <p><strong>Status:</strong> {paymentStatus.order.status}</p>
                <p><strong>Valor Total:</strong> R$ {paymentStatus.order.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-4">
              {paymentStatus.status === 'approved' ? (
                <>
                  <Button
                    onClick={() => router.push(`/orders/${paymentStatus.order.id}`)}
                    className="flex-1"
                  >
                    Ver Pedido
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="flex-1"
                  >
                    Continuar Comprando
                  </Button>
                </>
              ) : paymentStatus.status === 'rejected' ? (
                <>
                  <Button
                    onClick={tryAgain}
                    className="flex-1"
                  >
                    Tentar Novamente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/cart')}
                    className="flex-1"
                  >
                    Voltar ao Carrinho
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}