import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { getPaymentStatus } from '@/lib/payments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido' },
        { status: 400 }
      )
    }

    // Buscar informações do pagamento no Mercado Pago
    const paymentInfo = await getPaymentStatus(paymentId)
    
    if (!paymentInfo.id) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }

    // Buscar o pedido pelo payment_id
    const order = await db.getOrderByPaymentId(paymentInfo.id)
    if (!order) {
      console.log(`Pedido não encontrado para payment_id: ${paymentInfo.id}`)
      return NextResponse.json({ received: true })
    }

    // Mapear status do Mercado Pago para nosso sistema
    let newPaymentStatus: string
    let newOrderStatus: string

    switch (paymentInfo.status) {
      case 'approved':
        newPaymentStatus = 'paid'
        newOrderStatus = 'confirmed'
        break
      case 'pending':
        newPaymentStatus = 'processing'
        newOrderStatus = 'pending'
        break
      case 'in_process':
        newPaymentStatus = 'processing'
        newOrderStatus = 'pending'
        break
      case 'rejected':
        newPaymentStatus = 'failed'
        newOrderStatus = 'cancelled'
        break
      case 'cancelled':
        newPaymentStatus = 'cancelled'
        newOrderStatus = 'cancelled'
        break
      case 'refunded':
        newPaymentStatus = 'refunded'
        newOrderStatus = 'refunded'
        break
      default:
        newPaymentStatus = 'processing'
        newOrderStatus = 'pending'
    }

    // Atualizar status do pagamento e pedido
    await db.updatePaymentStatus(order.id, newPaymentStatus)
    await db.updateOrderStatus(order.id, newOrderStatus)

    // Se o pagamento foi aprovado, processar o pedido
    if (paymentInfo.status === 'approved') {
      await processApprovedPayment(order.id)
    }

    // Se o pagamento foi rejeitado ou cancelado, restaurar estoque
    if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
      await restoreStock(order.id)
    }

    console.log(`Webhook processado: Pedido ${order.id}, Status: ${paymentInfo.status}`)
    
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Processar pedido aprovado
async function processApprovedPayment(orderId: string) {
  try {
    // Aqui você pode adicionar lógica adicional para pedidos aprovados
    // Como enviar email de confirmação, gerar nota fiscal, etc.
    
    console.log(`Processando pedido aprovado: ${orderId}`)
    
    // Exemplo: Enviar email de confirmação
    // await sendOrderConfirmationEmail(orderId)
    
  } catch (error) {
    console.error('Erro ao processar pedido aprovado:', error)
  }
}

// Restaurar estoque quando pagamento é rejeitado/cancelado
async function restoreStock(orderId: string) {
  try {
    const order = await db.getOrderById(orderId)
    if (!order) return

    // Restaurar estoque dos produtos
    for (const item of order.order_items) {
      await db.updateProductStock(item.product_id, item.quantity)
    }
    
    console.log(`Estoque restaurado para pedido: ${orderId}`)
    
  } catch (error) {
    console.error('Erro ao restaurar estoque:', error)
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}