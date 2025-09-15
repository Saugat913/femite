import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import ProductCard from '@/components/ProductCard'
import { productService } from '@/services/product-service'
import ProductClient from '@/components/ProductClient'
import { Product } from '@/types'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Fetch product server-side for better SEO
  const product = await productService.getProduct(params.id)
  
  if (!product) {
    notFound()
  }
  
  // Fetch related products server-side
  const relatedProducts = await productService.getRelatedProducts(params.id, 3)


  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/shop">Shop</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image - Server Rendered */}
          <div className="space-y-4">
            <div className="aspect-square bg-hemp-beige rounded-lg overflow-hidden relative">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.isNew && (
                <span className="absolute top-4 right-4 bg-hemp-green-dark text-white text-sm font-bold px-3 py-1 rounded-full">
                  New
                </span>
              )}
            </div>
          </div>

          {/* Product Details - Mix of Server and Client */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold text-hemp-green-dark mb-6">${product.price.toFixed(2)}</p>
            
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Features - Server Rendered */}
            {product.features && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <span className="h-5 w-5 text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interactive Product Client Component */}
            <ProductClient product={product} />

            {/* Product Info - Server Rendered */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800">Category</h4>
                  <p className="text-gray-600">{product.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Material</h4>
                  <p className="text-gray-600">100% Organic Hemp</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Care Instructions</h4>
                  <p className="text-gray-600">Machine wash cold, tumble dry low</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products - Server Rendered */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Related Products</h2>
            <div className="product-grid">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
