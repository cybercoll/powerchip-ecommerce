'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'

// Tipos
interface Product {
  id: string
  name: string
  price: number
  image_url: string
  stock: number
}

interface CartItem {
  id: string
  product_id: string
  user_id: string
  quantity: number
  created_at: string
  product: Product
}

interface CartContextType {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
  addToCart: (productId: string, quantity: number) => Promise<boolean>
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>
  removeFromCart: (productId: string) => Promise<boolean>
  clearCart: () => Promise<boolean>
  isInCart: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
  refreshCart: () => Promise<void>
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider
interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const { data: session } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar itens do carrinho quando o usuário faz login
  useEffect(() => {
    if (session?.user?.id) {
      loadCartItems()
    } else {
      setItems([])
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Carregar itens do carrinho
  const loadCartItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/cart')
      
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      } else {
        console.error('Erro ao carregar carrinho:', response.statusText)
        setItems([])
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar produto ao carrinho
  const addToCart = async (productId: string, quantity: number): Promise<boolean> => {
    if (!session?.user?.id) {
      toast.error('Você precisa fazer login para adicionar produtos ao carrinho')
      // Redirecionar para página de login após um breve delay
      setTimeout(() => {
        window.location.href = '/auth/signin'
      }, 2000)
      return false
    }

    try {
      // Verificar se o produto já está no carrinho
      const existingItem = items.find(item => item.product_id === productId)
      
      if (existingItem) {
        // Se já existe, atualizar quantidade
        return await updateQuantity(productId, existingItem.quantity + quantity)
      }

      // Adicionar novo item
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          quantity,
        }),
      })

      if (response.ok) {
        // Recarregar todo o carrinho para garantir consistência
        await loadCartItems()
        toast.success('Produto adicionado ao carrinho')
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao adicionar produto')
        return false
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      toast.error('Erro ao adicionar produto')
      return false
    }
  }

  // Atualizar quantidade do item
  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    if (!session?.user?.id) {
      return false
    }

    try {
      if (quantity <= 0) {
        return await removeFromCart(productId)
      }

      // Encontrar o item do carrinho pelo product_id
      const cartItem = items.find(item => item.product_id === productId)
      if (!cartItem) {
        toast.error('Item não encontrado no carrinho')
        return false
      }

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: cartItem.id,
          quantity,
        }),
      })

      if (response.ok) {
        // Recarregar os itens do carrinho para obter dados atualizados
        await loadCartItems()
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atualizar quantidade')
        return false
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error)
      toast.error('Erro ao atualizar quantidade')
      return false
    }
  }

  // Remover item do carrinho
  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!session?.user?.id) {
      return false
    }

    try {
      // Encontrar o item do carrinho pelo product_id
      const cartItem = items.find(item => item.product_id === productId)
      if (!cartItem) {
        toast.error('Item não encontrado no carrinho')
        return false
      }

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: cartItem.id,
        }),
      })

      if (response.ok) {
        setItems(prev => prev.filter(item => item.product_id !== productId))
        toast.success('Produto removido do carrinho')
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao remover produto')
        return false
      }
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error)
      toast.error('Erro ao remover produto')
      return false
    }
  }

  // Limpar carrinho
  const clearCart = async (): Promise<boolean> => {
    if (!session?.user?.id) {
      return false
    }

    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
      })

      if (response.ok) {
        setItems([])
        toast.success('Carrinho limpo')
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao limpar carrinho')
        return false
      }
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error)
      toast.error('Erro ao limpar carrinho')
      return false
    }
  }

  // Verificar se produto está no carrinho
  const isInCart = (productId: string): boolean => {
    return items.some(item => item.product_id === productId)
  }

  // Obter quantidade do produto no carrinho
  const getItemQuantity = (productId: string): number => {
    const item = items.find(item => item.product_id === productId)
    return item ? item.quantity : 0
  }

  // Atualizar carrinho (função pública para recarregar)
  const refreshCart = async (): Promise<void> => {
    await loadCartItems()
  }

  // Calcular total
  const total = items.reduce((sum, item) => {
    if (item.product && item.product.price) {
      return sum + (item.product.price * item.quantity)
    }
    return sum
  }, 0)

  // Calcular quantidade total de itens
  const itemCount = items.reduce((sum, item) => {
    return sum + item.quantity
  }, 0)

  const value: CartContextType = {
    items,
    total,
    itemCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
    refreshCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Hook para usar o contexto
export function useCart(): CartContextType {
  const context = useContext(CartContext)
  
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  
  return context
}

export default CartContext