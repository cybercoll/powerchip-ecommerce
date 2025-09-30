import { NextResponse } from 'next/server'

// Mock data for categories when Supabase is not accessible
const mockCategories = [
  { id: '1', name: 'Processadores', description: 'CPUs e processadores' },
  { id: '2', name: 'Placas de Vídeo', description: 'GPUs e placas gráficas' },
  { id: '3', name: 'Memória RAM', description: 'Memórias RAM DDR4 e DDR5' },
  { id: '4', name: 'Armazenamento', description: 'SSDs e HDDs' },
  { id: '5', name: 'Placas-Mãe', description: 'Motherboards' }
]

export async function GET() {
  try {
    console.log('Using mock categories data due to network issues')
    return NextResponse.json(mockCategories)
  } catch (error) {
    console.error('Error in mock categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}