import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    // Buscar estatísticas do dashboard
    const [products, orders, users, revenue, recentOrders] = await Promise.all([
      // Total de produtos
      db.getProductCount(),
      
      // Total de pedidos
      db.getOrderCount(),
      
      // Total de usuários
      db.getUserCount(),
      
      // Receita total
      db.getTotalRevenue(),
      
      // Pedidos recentes (últimos 10)
      db.getRecentOrders(10)
    ]);

    const dashboardStats = {
      totalProducts: products,
      totalOrders: orders,
      totalUsers: users,
      totalRevenue: revenue,
      recentOrders: recentOrders
    };

    return NextResponse.json(dashboardStats);

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}