'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ShoppingCart, Star, Tag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatCurrency } from '@/lib/utils/format'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  brand?: string
  stock: number
  image_url: string
  specifications?: Record<string, string>
  featured?: boolean
  active: boolean
  discount?: number
  created_at: string
  updated_at: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCardClick = () => {
    router.push(`/products/${product.id}`)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation() // Previne navegação quando clica no botão
    
    if (product.stock === 0) {
      toast.error('Produto fora de estoque')
      return
    }

    setIsLoading(true)
    
    try {
      await addToCart(product.id, 1)
      toast.success('Produto adicionado ao carrinho')
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      toast.error('Erro ao adicionar produto')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDiscountedPrice = () => {
    if (!product.discount) return product.price
    return product.price * (1 - product.discount / 100)
  }

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: 'Sem estoque', color: 'text-red-600' }
    }
    if (product.stock <= 5) {
      return { text: `Últimas ${product.stock} unidades`, color: 'text-orange-600' }
    }
    return { text: `Em estoque (${product.stock})`, color: 'text-green-600' }
  }

  const stockStatus = getStockStatus()
  const discountedPrice = calculateDiscountedPrice()
  const hasDiscount = product.discount && product.discount > 0

  return (
    <article
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
      onClick={handleCardClick}
      data-testid="product-card"
      aria-label={`Produto: ${product.name}`}
    >
      {/* Badge de Destaque */}
      {product.featured && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Destaque
          </span>
        </div>
      )}

      {/* Badge de Desconto */}
      {hasDiscount && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Tag className="w-3 h-3 mr-1" />
            {product.discount}% OFF
          </span>
        </div>
      )}

      {/* Imagem do Produto */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {!imageError ? (
          <Image
            src={product.image_url || '/images/placeholder-product.svg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Imagem não disponível</span>
          </div>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4">
        {/* Nome e Marca */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
          )}
        </div>

        {/* Descrição */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Especificações Principais */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mb-3 space-y-1">
            {Object.entries(product.specifications)
              .slice(0, 2) // Mostrar apenas as 2 primeiras especificações
              .map(([key, value]) => (
                <p key={key} className="text-xs text-gray-500">
                  <span className="font-medium">{key}:</span> {value}
                </p>
              ))
            }
          </div>
        )}

        {/* Preço */}
        <div className="mb-3">
          {hasDiscount ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(discountedPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Status do Estoque */}
        <div className="mb-4">
          <span className={`text-sm font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Botão de Ação */}
        <div className="flex space-x-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-center hover:bg-gray-200 transition-colors text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Ver Detalhes
          </Link>
          
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
              aria-label="Adicionar ao carrinho"
            >
              {isLoading ? (
                <span>Adicionando...</span>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Adicionar ao Carrinho
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed text-sm font-medium"
            >
              Indisponível
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard