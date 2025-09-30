'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderData {
  id: string
  order_number: string
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  items: OrderItem[]
  user: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function CheckoutOrderPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.orderId as string

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    if (orderId) {
      loadOrderData()
    }
  }, [session, orderId])

  const loadOrderData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (response.ok) {
        const data = await response.json()
        setOrderData(data)
      } else if (response.status === 404) {
        setError('Pedido não encontrado')
      } else {
        setError('Erro ao carregar dados do pedido')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error)
      setError('Erro ao carregar dados do pedido')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (result: any) => {
    toast.success('Pagamento processado com sucesso!')
    
    if (result.payment.paymentMethod === 'pix') {
      router.push(`/payment/pix?paymentId=${result.payment.id}`)
    } else if (result.payment.paymentMethod === 'boleto') {
      router.push(`/payment/boleto?paymentId=${result.payment.id}`)
    } else {
      router.push(`/payment/card?paymentId=${result.payment.id}`)
    }
  }

  const handlePaymentError = (error: string) => {
    toast.error(error)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div>Carregando...</div>
        </div>
      </div>
    )
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

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro</h1>
            <p className="text-gray-600 mb-4">{error || 'Pedido não encontrado'}</p>
            <button
              onClick={() => router.push('/cart')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Voltar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Verificar se o pedido já foi pago
  if (orderData.payment_status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pedido já Pago</h1>
            <p className="text-gray-600 mb-4">
              Este pedido (#{orderData.order_number}) já foi pago.
            </p>
            <button
              onClick={() => router.push('/orders')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ver Meus Pedidos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Finalizar Compra</h1>
            <p className="text-gray-600 mt-2">
              Pedido #{orderData.order_number} - {orderData.user.first_name} {orderData.user.last_name}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resumo do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">{item.product_sku}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                          <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                        </div>
                      </div>
                      <p className="font-medium">
                        R$ {item.total_price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {orderData.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Componente de Pagamento do Mercado Pago */}
            <MercadoPagoCheckout
              orderData={{
                id: orderData.id,
                total_amount: orderData.total_amount
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>
      </div>
    </div>
  )
}