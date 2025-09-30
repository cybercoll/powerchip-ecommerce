import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const product = await db.getProductById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Verificar se o produto existe
    const { id } = await params;
    const existingProduct = await db.getProductById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar produto
    const updatedProduct = await db.updateProduct(id, {
      name,
      description,
      price,
      stock_quantity: stock_quantity || 0,
      category_id,
      image_url: image_url || existingProduct.image_url,
      specifications: specifications || existingProduct.specifications
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // Verificar se o produto existe
    const existingProduct = await db.getProductById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se há pedidos associados ao produto
    const hasOrders = await db.checkProductHasOrders(id);
    if (hasOrders) {
      return NextResponse.json(
        { error: 'Não é possível excluir um produto que possui pedidos associados' },
        { status: 400 }
      );
    }

    // Excluir produto
    await db.deleteProduct(id);

    return NextResponse.json({ message: 'Produto excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}