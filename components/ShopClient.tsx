'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/utils/format'

interface ShopClientProps {
  initialProducts: Product[]
  categories: string[]
  initialSearchQuery?: string
}

export default function ShopClient({ initialProducts, categories, initialSearchQuery }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const displayProducts = selectedCategory === 'All' 
    ? initialProducts 
    : initialProducts.filter((product: Product) => product.category === selectedCategory)

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
      {/* Desktop Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Filters</h2>
          
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-hemp-green-dark text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="lg:col-span-3">
        {/* Results Count and Search Info */}
        <div className="flex flex-col gap-3 mb-6">
          {initialSearchQuery && (
            <div className="bg-hemp-green-light/20 border border-hemp-green-light rounded-lg p-3">
              <p className="text-hemp-text font-medium">
                Search results for: <span className="font-bold text-hemp-green-dark">"{initialSearchQuery}"</span>
              </p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-gray-600 font-medium">
              Showing <span className="font-semibold text-hemp-green-dark">{displayProducts.length}</span> of <span className="font-semibold">{initialProducts.length}</span> products
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product: Product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative group">
                <Image
                  src={product.image || '/placeholder-image.jpg'}
                  alt={product.name}
                  width={400}
                  height={320}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                />
                {product.isNew && (
                  <span className="absolute top-3 right-3 bg-hemp-green-dark text-white text-xs font-bold px-2 py-1 rounded">
                    New
                  </span>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-hemp-green-dark transition-colors">
                  <Link href={`/shop/${product.id}`}>
                    {product.name}
                  </Link>
                </h3>
                <p className="text-hemp-green-dark font-semibold text-lg mb-2">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{product.category}</span>
                  <Link 
                    href={`/shop/${product.id}`}
                    className="bg-hemp-green-dark text-white px-4 py-2 rounded hover:bg-hemp-green-dark/90 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No products found in this category.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="bg-hemp-green-dark text-white px-6 py-2 rounded hover:bg-hemp-green-dark/90 transition-colors"
            >
              Show All Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}