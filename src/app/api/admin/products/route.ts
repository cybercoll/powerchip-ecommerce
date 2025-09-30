import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, price, stock_quantity, category_id, image_url, specifications } = body;

    // Validações básicas
    if (!name || !description || !price || !category_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, description, price, category_id' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'O preço deve ser maior que zero' },
        { status: 400 }
      );
    }

    if (stock_quantity < 0) {
      return NextResponse.json(
        { error: 'A quantidade em estoque não pode ser negativa' },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe
    const category = await db.getCategoryById(category_id);
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 400 }
      );
    }

    // Criar produto
    const newProduct = await db.createProduct({
      name,
      description,
      price,
      stock_quantity: stock_quantity || 0,
      category_id,
      image_url: image_url || '/images/placeholder-product.svg',
      specifications: specifications || {}
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const products = await db.getProducts({
      categoryId: categoryId || undefined,
      search: search || undefined,
      limit,
      offset
    });

    return NextResponse.json({ products, total: products.length });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}