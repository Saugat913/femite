import Link from 'next/link'
import { Filter, X, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Layout from '@/components/Layout'
import { productService } from '@/services/product-service'
import ShopClient from '@/components/ShopClient'

// Use ISR with revalidation for optimal performance
export const revalidate = 60 // Revalidate every 60 seconds

interface ShopPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Shop({ searchParams }: ShopPageProps) {
  // Get search query from URL parameters
  const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : ''
  
  // Fetch products server-side for better SEO and initial load
  const { products } = await productService.getProducts({ 
    limit: 50,
    search: searchQuery || undefined
  })
  
  // Extract categories from products
  const productCategories = Array.from(new Set(products.map(p => p.category))) as string[]
  const categories = ['All', ...productCategories]

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
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop Hemp Clothing'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {searchQuery 
              ? `Found ${products.length} product${products.length !== 1 ? 's' : ''} matching your search.`
              : 'Discover our complete collection of sustainable hemp apparel. Each piece is crafted with care for both your comfort and the planet.'
            }
          </p>
        </div>

        {/* Use client component for interactive filtering */}
        <ShopClient initialProducts={products} categories={categories} initialSearchQuery={searchQuery} />
      </div>
    </Layout>
  )
}
