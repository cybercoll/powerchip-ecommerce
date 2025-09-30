import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'

// GET - Buscar pedidos do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const orders = await db.getOrdersByUser(session.user.id)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar pedido a partir do carrinho
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar itens do carrinho
    const cartItems = await db.getCartItems(session.user.id)
    
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio' },
        { status: 400 }
      )
    }

    // Calcular total
    let totalAmount = 0
    const orderItems = []

    for (const item of cartItems) {
      if (!item.products || !item.products.active) {
        return NextResponse.json(
          { error: `Produto ${item.products?.name || 'desconhecido'} não está mais disponível` },
          { status: 400 }
        )
      }

      // Verificar estoque
      if (item.quantity > item.products.stock_quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${item.products.name}` },
          { status: 400 }
        )
      }

      const itemTotal = item.quantity * item.products.price
      totalAmount += itemTotal

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
        total: itemTotal
      })
    }

    // Criar pedido
    const orderId = uuidv4()
    const orderData = {
      id: orderId,
      user_id: session.user.id,
      order_number: `ORD-${Date.now()}`,
      subtotal: totalAmount,
      total_amount: totalAmount,
      status: 'pending' as const,
      payment_status: 'pending' as const,
      payment_method: 'pix' as const,
      shipping_address: JSON.stringify({
        street: 'Rua Exemplo, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil'
      })
    }

    const order = await db.createOrder(orderData)

    // Criar itens do pedido
    const orderItemsData = cartItems.map(item => ({
      id: uuidv4(),
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.products.name,
      quantity: item.quantity,
      unit_price: item.products.price,
      total_price: item.products.price * item.quantity
    }))

    await db.createOrderItems(orderItemsData)

    // Buscar pedido completo com itens
    const fullOrder = await db.getOrderById(orderId)

    return NextResponse.json(fullOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}