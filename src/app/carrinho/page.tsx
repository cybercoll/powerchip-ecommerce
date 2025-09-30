'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
// Tipo para os itens do carrinho com produto relacionado
interface CartItemWithProduct {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  products?: {
    id: string
    name: string
    price: number
    image_url?: string
    stock_quantity: number
  }
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchCartItems()
  }, [session, status, router])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItems(data)
      } else {
        toast.error('Erro ao carregar carrinho')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Erro ao carregar carrinho')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(itemId)
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      })

      if (response.ok) {
        await fetchCartItems()
        toast.success('Quantidade atualizada')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao atualizar quantidade')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Erro ao atualizar quantidade')
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      })

      if (response.ok) {
        await fetchCartItems()
        toast.success('Item removido do carrinho')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao remover item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Erro ao remover item')
    } finally {
      setUpdating(null)
    }
  }

  const clearCart = async () => {
    if (!confirm('Tem certeza que deseja limpar o carrinho?')) return

    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
      })

      if (response.ok) {
        setCartItems([])
        toast.success('Carrinho limpo')
      } else {
        toast.error('Erro ao limpar carrinho')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Erro ao limpar carrinho')
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products?.price || 0) * item.quantity
    }, 0)
  }

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Carrinho vazio')
      return
    }
    router.push('/checkout')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex space-x-4">
                  <div className="w-20 h-20 bg-gray-300 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Carrinho</h1>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-500 text-sm font-medium"
            >
              Limpar Carrinho
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Adicione alguns produtos para começar suas compras</p>
            <Link
              href="/loja"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continuar Comprando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.products?.image_url || '/images/placeholder-product.svg'}
                        alt={item.products?.name || 'Produto'}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/loja/${item.products?.id || '#'}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.products?.name || 'Produto não encontrado'}
                      </Link>
                      <p className="text-gray-600 mt-1">
                        R$ {(item.products?.price || 0).toFixed(2).replace('.', ',')}
                      </p>
                      
                      {item.quantity > (item.products?.stock_quantity || 0) && (
                        <p className="text-red-600 text-sm mt-1">
                          ⚠️ Apenas {item.products?.stock_quantity || 0} disponíveis em estoque
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      
                      <span className="w-12 text-center font-medium">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= (item.products?.stock_quantity || 0)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        R$ {((item.products?.price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-sm text-red-600 hover:text-red-500 mt-1 disabled:opacity-50"
                      >
                        {updating === item.id ? 'Removendo...' : 'Remover'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Pedido</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})</span>
                    <span>R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frete</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                
                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Finalizar Compra
                </button>
                
                <Link
                  href="/loja"
                  className="block text-center text-blue-600 hover:text-blue-500 mt-4 text-sm font-medium"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}