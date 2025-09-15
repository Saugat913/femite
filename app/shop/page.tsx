'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Filter, X, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Layout from '@/components/Layout'
import PageLoading from '@/components/PageLoading'

export default function Shop() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>(['All'])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/')
        const data = await response.json()
        const fetchedProducts = data.products || []
        setProducts(fetchedProducts)
        
        // Extract categories from products
        const productCategories = Array.from(new Set(fetchedProducts.map((p: any) => p.category))) as string[]
        setCategories(['All', ...productCategories])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  const displayProducts = selectedCategory === 'All' 
    ? products 
    : products.filter((product: any) => product.category === selectedCategory)

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
  }

  if (loading) {
    return (
      <PageLoading 
        title="Discovering Hemp Fashion"
        description="Curating our collection of scientifically superior hemp clothing just for you..."
      />
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-hemp-green-dark">Home</Link>
          <span className="mx-2">/</span>
          <span>Shop</span>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Shop Hemp Clothing
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of sustainable hemp apparel. Each piece is crafted with care for both your comfort and the planet.
          </p>
        </div>

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
            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 font-medium">
                Showing <span className="font-semibold text-hemp-green-dark">{displayProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProducts.map((product: any) => (
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
                      ${product.price.toFixed(2)}
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
      </div>
    </Layout>
  )
}
