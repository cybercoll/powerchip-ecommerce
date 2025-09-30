import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/database'

// GET - Buscar itens do carrinho
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const cartItems = await db.getCartItems(session.user.id)
    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Adicionar item ao carrinho
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Cart POST body:', body)
    const { productId, quantity } = body

    console.log('Validating:', { productId, quantity, type: typeof quantity })
    
    if (!productId || !quantity || quantity < 1) {
      console.log('Validation failed:', { productId, quantity })
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Verificar se o produto existe e está ativo
    const product = await db.getProductById(productId)
    if (!product || !product.active) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar estoque
    if (quantity > product.stock_quantity) {
      return NextResponse.json(
        { error: 'Quantidade indisponível em estoque' },
        { status: 400 }
      )
    }

    // Verificar se o item já existe no carrinho
    const existingItem = await db.getCartItem(session.user.id, productId)
    
    let cartItem
    if (existingItem) {
      // Atualizar quantidade
      const newQuantity = existingItem.quantity + quantity
      
      if (newQuantity > product.stock_quantity) {
        return NextResponse.json(
          { error: 'Quantidade total excede o estoque disponível' },
          { status: 400 }
        )
      }
      
      cartItem = await db.updateCartItemQuantity(existingItem.id, newQuantity)
    } else {
      // Adicionar novo item
      cartItem = await db.addToCart(session.user.id, productId, quantity, product.price)
    }

    // Buscar o item completo com informações do produto
    const fullCartItem = await db.getCartItemWithProduct(cartItem.id)
    
    return NextResponse.json(fullCartItem)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar quantidade do item
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { itemId, quantity } = await request.json()

    if (!itemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Verificar se o item pertence ao usuário
    const cartItem = await db.getCartItemById(itemId)
    if (!cartItem || cartItem.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Verificar estoque
    const product = await db.getProductById(cartItem.product_id)
    if (!product || quantity > product.stock_quantity) {
      return NextResponse.json(
        { error: 'Quantidade indisponível em estoque' },
        { status: 400 }
      )
    }

    await db.updateCartItemQuantity(itemId, quantity)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover item do carrinho
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { error: 'ID do item é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o item pertence ao usuário
    const cartItem = await db.getCartItemById(itemId)
    if (!cartItem || cartItem.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    await db.removeFromCart(itemId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}