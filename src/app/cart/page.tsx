'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Header from '@/components/Header'

interface CartItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  product: {
    name: string
    image_url: string
    price: number
  }
}

export default function CartPage() {
  const { data: session } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchCartItems()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity })
      })

      if (response.ok) {
        fetchCartItems()
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      })

      if (response.ok) {
        fetchCartItems()
      }
    } catch (error) {
      console.error('Erro ao remover item:', error)
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'POST'
      })

      if (response.ok) {
        setCartItems([])
      }
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Faça login para ver seu carrinho</h2>
            <Link href="/auth/signin">
              <Button>Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando carrinho...</div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Seu carrinho está vazio</h2>
            <Link href="/loja">
              <Button>Continuar Comprando</Button>
            </Link>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Carrinho de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Carrinho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.products?.image_url || '/images/placeholder.jpg'}
                      alt={item.products?.name || 'Produto'}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.products?.name || 'Produto não encontrado'}</h3>
                      <p className="text-gray-600">R$ {item.unit_price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={clearCart}>
                  Limpar Carrinho
                </Button>
                <Link href="/loja">
                  <Button variant="outline">Continuar Comprando</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>Grátis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
              
              <Link href="/checkout" className="block mt-4">
                <Button className="w-full" disabled={cartItems.length === 0}>
                  Finalizar Compra
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}