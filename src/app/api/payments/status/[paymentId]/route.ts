import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/database'
import { getPaymentStatus } from '@/lib/payments'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { paymentId } = await params

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar o pedido pelo payment_id
    const order = await db.getOrderByPaymentId(paymentId)
    if (!order) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o pedido pertence ao usuário
    if (order.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar status atualizado no Mercado Pago
    const paymentInfo = await getPaymentStatus(paymentId)
    
    // Mapear status para formato amigável
    const statusMap: { [key: string]: string } = {
      'pending': 'Aguardando pagamento',
      'approved': 'Pagamento aprovado',
      'authorized': 'Pagamento autorizado',
      'in_process': 'Processando pagamento',
      'in_mediation': 'Em mediação',
      'rejected': 'Pagamento rejeitado',
      'cancelled': 'Pagamento cancelado',
      'refunded': 'Pagamento estornado',
      'charged_back': 'Chargeback'
    }

    const response = {
      paymentId: paymentInfo.id,
      status: paymentInfo.status,
      statusDescription: statusMap[paymentInfo.status || ''] || 'Status desconhecido',
      statusDetail: paymentInfo.statusDetail,
      amount: paymentInfo.amount,
      netAmount: paymentInfo.netAmount,
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.payment_status,
        totalAmount: order.total_amount
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}