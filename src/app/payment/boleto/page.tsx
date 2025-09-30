'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FileText, Download, Copy, CheckCircle, Clock, Loader2 } from 'lucide-react'
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

export default function BoletoPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get('paymentId')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [boletoCode, setBoletoCode] = useState('')
  const [boletoUrl, setBoletoUrl] = useState('')
  const [expirationDate, setExpirationDate] = useState('')

  useEffect(() => {
    if (!paymentId) {
      router.push('/cart')
      return
    }

    loadPaymentData()
    
    // Verificar status a cada 30 segundos (boleto demora mais para processar)
    const interval = setInterval(() => {
      checkPaymentStatus()
    }, 30000)

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
        
        // Simular dados do boleto (em produção, viria da API do Mercado Pago)
        setBoletoCode('34191.79001 01043.510047 91020.150008 1 84770000012345')
        setBoletoUrl(`/api/payments/boleto/${paymentId}/pdf`)
        
        // Data de vencimento (3 dias úteis)
        const expDate = new Date()
        expDate.setDate(expDate.getDate() + 3)
        setExpirationDate(expDate.toLocaleDateString('pt-BR'))
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

  const copyBoletoCode = () => {
    navigator.clipboard.writeText(boletoCode)
    toast.success('Código do boleto copiado!')
  }

  const downloadBoleto = () => {
    // Em produção, isso abriria o PDF do boleto
    window.open(boletoUrl, '_blank')
    toast.success('Download do boleto iniciado')
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
              <FileText className="h-6 w-6" />
              <span>Pagamento via Boleto</span>
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
                  <p>Vencimento: <span className="font-bold">{expirationDate}</span></p>
                  <p className="mt-1">O pagamento pode levar até 2 dias úteis para ser processado</p>
                </div>
              )}
            </div>

            {/* Valor */}
            <div className="text-center bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Valor a pagar</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {paymentStatus.amount.toFixed(2)}
              </p>
            </div>

            {/* Ações do Boleto */}
            {paymentStatus.status === 'pending' && (
              <>
                {/* Botão de Download */}
                <div className="text-center">
                  <Button onClick={downloadBoleto} size="lg" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Baixar Boleto (PDF)
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Clique para baixar e imprimir o boleto
                  </p>
                </div>

                {/* Código de Barras */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de barras do boleto:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={boletoCode}
                      readOnly
                      className="flex-1 p-3 border rounded-lg bg-gray-50 text-sm font-mono"
                    />
                    <Button onClick={copyBoletoCode} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use este código para pagar pelo internet banking
                  </p>
                </div>

                {/* Instruções */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Como pagar:</h3>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Baixe e imprima o boleto</li>
                    <li>2. Pague em qualquer banco, lotérica ou internet banking</li>
                    <li>3. Ou use o código de barras no app do seu banco</li>
                    <li>4. O pagamento será processado em até 2 dias úteis</li>
                    <li>5. Você receberá uma confirmação por email</li>
                  </ol>
                </div>

                {/* Aviso de Vencimento */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900">Atenção ao prazo</h3>
                      <p className="text-sm text-yellow-800">
                        O boleto vence em <strong>{expirationDate}</strong>. 
                        Após o vencimento, será necessário gerar um novo boleto.
                      </p>
                    </div>
                  </div>
                </div>
              </>
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