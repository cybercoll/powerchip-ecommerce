'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import MercadoPagoCheckout from '@/components/MercadoPagoCheckout'

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    name: string
    price: number
    image_url: string
  }
}

interface OrderData {
  id: string
  total_amount: number
  items: CartItem[]
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    loadOrderData()
  }, [session])

  const loadOrderData = async () => {
    try {
      // Buscar dados do pedido pendente ou criar novo pedido
      const response = await fetch('/api/orders/pending')
      if (response.ok) {
        const data = await response.json()
        setOrderData(data)
      } else {
        // Se não há pedido pendente, criar um novo
        await createOrderFromCart()
      }
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error)
      toast.error('Erro ao carregar dados do pedido')
    }
  }

  const createOrderFromCart = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setOrderData(data)
      } else {
        throw new Error('Falha ao criar pedido')
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      toast.error('Erro ao criar pedido')
      router.push('/cart')
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

  if (!orderData) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData?.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.products.name}</p>
                        <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">
                      R$ {(item.products.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {orderData?.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Componente de Pagamento do Mercado Pago */}
          <MercadoPagoCheckout
            orderData={orderData}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>
      </div>
      </div>
    </div>
  )
}