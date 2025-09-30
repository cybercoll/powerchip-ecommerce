import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/database'

// GET - Buscar pedido pendente do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar pedido pendente mais recente
    const orders = await db.getOrdersByUser(session.user.id)
    const pendingOrder = orders.find(order => 
      order.status === 'pending' && order.payment_status === 'pending'
    )

    if (!pendingOrder) {
      return NextResponse.json(
        { error: 'Nenhum pedido pendente encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(pendingOrder)
  } catch (error) {
    console.error('Error fetching pending order:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}