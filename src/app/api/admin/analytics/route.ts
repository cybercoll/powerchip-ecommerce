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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calcular data de início baseada no range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Buscar dados de analytics
    const [salesByMonth, topProducts, customerStats, paymentMethods] = await Promise.all([
      // Vendas por mês (simulado)
      getSalesByMonth(startDate),
      
      // Produtos mais vendidos (simulado)
      getTopProducts(),
      
      // Estatísticas de clientes
      getCustomerStats(startDate),
      
      // Métodos de pagamento (simulado)
      getPaymentMethods()
    ]);

    const analyticsData = {
      salesByMonth,
      topProducts,
      customerStats,
      paymentMethods
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Erro ao buscar dados de analytics:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para vendas por mês (simulada)
async function getSalesByMonth(startDate: Date) {
  // Por enquanto, retornamos dados simulados
  // Em uma implementação real, isso viria do banco de dados
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    months.push({
      month: monthName,
      sales: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 50000) + 10000
    });
  }
  
  return months;
}

// Função auxiliar para produtos mais vendidos (simulada)
async function getTopProducts() {
  // Por enquanto, retornamos dados simulados
  // Em uma implementação real, isso viria do banco de dados
  return [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      sales: 45,
      revenue: 67500
    },
    {
      id: '2', 
      name: 'Samsung Galaxy S24 Ultra',
      sales: 38,
      revenue: 53200
    },
    {
      id: '3',
      name: 'MacBook Pro M3',
      sales: 22,
      revenue: 44000
    },
    {
      id: '4',
      name: 'iPad Pro 12.9"',
      sales: 31,
      revenue: 31000
    },
    {
      id: '5',
      name: 'AirPods Pro 2',
      sales: 67,
      revenue: 20100
    }
  ];
}

// Função auxiliar para estatísticas de clientes
async function getCustomerStats(startDate: Date) {
  try {
    const totalCustomers = await db.getUserCount();
    
    // Por enquanto, simulamos novos e recorrentes
    // Em uma implementação real, isso viria de consultas específicas
    const newCustomers = Math.floor(totalCustomers * 0.2);
    const returningCustomers = totalCustomers - newCustomers;
    
    return {
      totalCustomers,
      newCustomers,
      returningCustomers
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de clientes:', error);
    return {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0
    };
  }
}

// Função auxiliar para métodos de pagamento (simulada)
async function getPaymentMethods() {
  // Por enquanto, retornamos dados simulados
  // Em uma implementação real, isso viria do banco de dados
  const methods = [
    { method: 'PIX', count: 156, percentage: 52.0 },
    { method: 'Cartão de Crédito', count: 98, percentage: 32.7 },
    { method: 'Cartão de Débito', count: 32, percentage: 10.7 },
    { method: 'Boleto', count: 14, percentage: 4.6 }
  ];
  
  return methods;
}