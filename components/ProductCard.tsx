'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { useServerCart } from '@/lib/use-server-cart'
import { formatCurrency } from '@/lib/utils/format'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useServerCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAdding) return
    
    setIsAdding(true)
    
    // Use default size and color for quick add
    const defaultSize = product.sizes[0] || 'M'
    const defaultColor = product.colors[0] || 'Natural'
    
    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: defaultSize,
        color: defaultColor
      })
      
      setTimeout(() => setIsAdding(false), 1500)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAdding(false)
    }
  }

  return (
    <div className="card overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden">
        <Link href={`/shop/${product.id}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={320}
            className="w-full h-64 sm:h-72 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        {product.isNew && (
          <span className="absolute top-4 right-4 bg-hemp-green-dark text-white text-xs font-semibold px-3 py-1 rounded-full">
            New
          </span>
        )}
        
        {/* Quick Action Buttons */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
          <div className="w-full p-4 flex space-x-2">
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm ${
                isAdding 
                  ? 'bg-green-500 text-white' 
                  : 'bg-hemp-green-dark/90 text-white hover:bg-hemp-green-dark'
              }`}
            >
              {isAdding ? (
                'Added!'
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                  Quick Add
                </>
              )}
            </button>
            <Link
              href={`/shop/${product.id}`}
              className="py-3 px-4 bg-white/90 text-hemp-green-dark rounded-lg hover:bg-white transition-all duration-200 backdrop-blur-sm"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="card-padding">
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-lg font-semibold text-hemp-text mb-3 hover:text-hemp-green-dark transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xl font-bold text-hemp-green-dark">{formatCurrency(product.price)}</p>
          {product.isNew && (
            <span className="text-xs font-medium text-hemp-green-dark bg-hemp-green-light px-2 py-1 rounded-full">
              New Arrival
            </span>
          )}
        </div>
        
        {/* Size and Color Info */}
        <div className="flex items-center justify-between text-sm text-hemp-muted">
          <span className="font-medium">{product.sizes?.length || 0} sizes available</span>
          <span className="font-medium">{product.colors?.length || 0} colors</span>
        </div>
      </div>
    </div>
  )
}
