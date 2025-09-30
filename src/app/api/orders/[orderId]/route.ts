import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { orderId } = params

    // Buscar o pedido com seus itens
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        total_amount,
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        status,
        payment_status,
        payment_method,
        shipping_address,
        billing_address,
        notes,
        created_at,
        updated_at
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o pedido pertence ao usuário autenticado
    if (order.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar os itens do pedido
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        product_id,
        product_name,
        product_sku,
        quantity,
        unit_price,
        total_price
      `)
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Erro ao buscar itens do pedido:', itemsError)
      return NextResponse.json(
        { error: 'Erro ao buscar itens do pedido' },
        { status: 500 }
      )
    }

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', order.user_id)
      .single()

    if (userError) {
      console.error('Erro ao buscar dados do usuário:', userError)
      return NextResponse.json(
        { error: 'Erro ao buscar dados do usuário' },
        { status: 500 }
      )
    }

    // Montar resposta
    const orderData = {
      id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      shipping_amount: order.shipping_amount,
      discount_amount: order.discount_amount,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: orderItems || [],
      user: user
    }

    return NextResponse.json(orderData)

  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}