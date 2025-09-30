import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/database'
import { createPixPayment, createCreditCardPayment, createBoletoPayment, PaymentData } from '@/lib/payments'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, paymentMethod, cardData, installments } = body

    // Verificar se o pedido existe e pertence ao usuário
    const order = await db.getOrderById(orderId)
    if (!order || order.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o pedido ainda está pendente
    if (order.payment_status !== 'pending') {
      return NextResponse.json(
        { error: 'Pedido já foi processado' },
        { status: 400 }
      )
    }

    // Buscar dados do usuário
    const user = await db.getUserById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const paymentData: PaymentData = {
      orderId: order.id,
      amount: order.total_amount,
      description: `Pedido #${order.id} - PowerChip E-commerce`,
      payerEmail: user.email,
      payerName: user.name,
      payerDocument: user.document || '00000000000',
      paymentMethod,
      installments,
      cardToken: cardData?.token
    }

    let paymentResponse

    switch (paymentMethod) {
      case 'pix':
        paymentResponse = await createPixPayment(paymentData)
        break
      case 'credit_card':
        if (!cardData?.token) {
          return NextResponse.json(
            { error: 'Token do cartão é obrigatório' },
            { status: 400 }
          )
        }
        paymentResponse = await createCreditCardPayment(paymentData)
        break
      case 'boleto':
        paymentResponse = await createBoletoPayment(paymentData)
        break
      default:
        return NextResponse.json(
          { error: 'Método de pagamento inválido' },
          { status: 400 }
        )
    }

    // Atualizar o pedido com as informações do pagamento
    await db.updatePaymentInfo(orderId, {
      payment_id: paymentResponse.id,
      payment_method: paymentMethod,
      payment_status: 'processing'
    })

    return NextResponse.json({
      success: true,
      payment: paymentResponse
    })

  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}