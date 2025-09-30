import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Mock data for when Supabase is not accessible
const mockCategories = [
  { id: '1', name: 'Processadores', description: 'CPUs e processadores' },
  { id: '2', name: 'Placas de Vídeo', description: 'GPUs e placas gráficas' },
  { id: '3', name: 'Memória RAM', description: 'Memórias RAM DDR4 e DDR5' },
  { id: '4', name: 'Armazenamento', description: 'SSDs e HDDs' },
  { id: '5', name: 'Placas-Mãe', description: 'Motherboards' }
]

export async function GET() {
  try {
    console.log('Fetching categories...')
    const categories = await db.getCategories()
    console.log('Categories fetched successfully:', categories?.length || 0)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}