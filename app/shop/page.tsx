import Link from 'next/link'
import { Filter, X, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Layout from '@/components/Layout'
import { productService } from '@/services/product-service'
import ShopClient from '@/components/ShopClient'

export default async function Shop() {
  // Fetch products server-side for better SEO and initial load
  const { products } = await productService.getProducts({ limit: 50 })
  
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
            Shop Hemp Clothing
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of sustainable hemp apparel. Each piece is crafted with care for both your comfort and the planet.
          </p>
        </div>

        {/* Use client component for interactive filtering */}
        <ShopClient initialProducts={products} categories={categories} />
      </div>
    </Layout>
  )
}
