import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Mock data for when Supabase is not accessible
const mockProducts = [
  {
    id: '1',
    name: 'Intel Core i7-13700K',
    description: 'Processador Intel Core i7 de 13ª geração',
    price: 2299.99,
    image_url: '/images/intel-i7.svg',
    category_id: '1',
    stock: 15,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'NVIDIA RTX 4070',
    description: 'Placa de vídeo NVIDIA GeForce RTX 4070',
    price: 3499.99,
    image_url: '/images/rtx-4070.svg',
    category_id: '2',
    stock: 8,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Corsair Vengeance 32GB DDR5',
    description: 'Memória RAM DDR5 32GB (2x16GB) 5600MHz',
    price: 899.99,
    image_url: '/images/corsair-ram.svg',
    category_id: '3',
    stock: 25,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Samsung 980 PRO 1TB',
    description: 'SSD NVMe M.2 1TB Samsung 980 PRO',
    price: 599.99,
    image_url: '/images/samsung-ssd.svg',
    category_id: '4',
    stock: 12,
    created_at: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'name'
    const offset = (page - 1) * limit

    // Validar parâmetros
    if (limit > 50) {
      return NextResponse.json(
        { error: 'Limite máximo de 50 produtos por página' },
        { status: 400 }
      )
    }

    const products = await db.getProducts({
      categoryId: categoryId || undefined,
      search: search || undefined,
      sortBy,
      limit,
      offset,
      includeOutOfStock: false // Não incluir produtos fora de estoque na loja pública
    })

    // Contar total de produtos para paginação
    const totalProducts = await db.getProductCount({
      categoryId: categoryId || undefined,
      search: search || undefined,
      includeOutOfStock: false
    })

    return NextResponse.json({
      products,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: page < Math.ceil(totalProducts / limit),
      hasPrevPage: page > 1
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // This would be for admin to create products
    // Implementation would go here
    return NextResponse.json(
      { error: 'Not implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}