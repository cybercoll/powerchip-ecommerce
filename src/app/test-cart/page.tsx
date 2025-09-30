'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'

export default function TestCartPage() {
  const { data: session, status } = useSession()
  const [productId, setProductId] = useState('4c18c921-153e-4d0d-9736-94981fc30daf')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const testAddToCart = async () => {
    if (!session) {
      toast.error('Faça login primeiro')
      return
    }

    setLoading(true)
    try {
      console.log('Enviando para API:', { productId, quantity })
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        toast.success('Produto adicionado ao carrinho!')
      } else {
        toast.error(data.error || 'Erro ao adicionar produto')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    try {
      const result = await signIn('credentials', {
        email: 'admin@powerchip.com.br',
        password: 'admin123',
        redirect: false
      })
      
      if (result?.error) {
        toast.error('Erro no login')
      } else {
        toast.success('Login realizado com sucesso!')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Erro no login')
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Teste do Carrinho</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Status da Sessão</h2>
        <p>Status: {status}</p>
        {session ? (
          <div>
            <p>Usuário: {session.user?.email}</p>
            <p>ID: {session.user?.id}</p>
            <button 
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded mt-2"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login como Admin
          </button>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Teste Adicionar ao Carrinho</h2>
        <div className="mb-4">
          <label className="block mb-2">Product ID:</label>
          <input 
            type="text" 
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Quantidade:</label>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border p-2 w-full"
          />
        </div>
        <button 
          onClick={testAddToCart}
          disabled={loading || !session}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </div>
  )
}