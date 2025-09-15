'use client'

import { useState, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import ProductCard from '@/components/ProductCard'
import { productService } from '@/services/product-service'
import { cartService } from '@/services/cart-service'
import { useCart } from '@/lib/cart-context'
import { ShoppingCart, Check, Plus, Minus, Heart, Zap } from 'lucide-react'
import { Product } from '@/types'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await productService.getProduct(params.id)
        if (!fetchedProduct) {
          notFound()
          return
        }
        setProduct(fetchedProduct)
        
        // Fetch related products
        const related = await productService.getRelatedProducts(params.id, 3)
        setRelatedProducts(related)
      } catch (error) {
        console.error('Error fetching product:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 w-3/4"></div>
              <div className="h-6 bg-gray-200 w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200"></div>
                <div className="h-4 bg-gray-200 w-5/6"></div>
                <div className="h-4 bg-gray-200 w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!product) {
    return notFound()
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    if (!selectedSize || !selectedColor) {
      const missing = []
      if (!selectedSize) missing.push('size')
      if (!selectedColor) missing.push('color')
      alert(`Please select a ${missing.join(' and ')} before adding to cart.`)
      return
    }

    setIsLoading(true)
    
    try {
      // Add to local cart context for immediate UI update
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || product.image,
        size: selectedSize,
        color: selectedColor
      }, quantity)

      // Also sync with backend if available
      try {
        await cartService.addToCart({
          productId: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor
        })
      } catch (backendError) {
        console.warn('Backend cart sync failed:', backendError)
        // Continue with local cart only
      }

      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    
    if (!selectedSize || !selectedColor) {
      const missing = []
      if (!selectedSize) missing.push('size')
      if (!selectedColor) missing.push('color')
      alert(`Please select a ${missing.join(' and ')} to proceed with purchase.`)
      return
    }

    setIsBuyingNow(true)
    
    try {
      // Add to cart first
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || product.image,
        size: selectedSize,
        color: selectedColor
      }, quantity)

      // Sync with backend if available
      try {
        await cartService.addToCart({
          productId: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor
        })
      } catch (backendError) {
        console.warn('Backend cart sync failed:', backendError)
      }

      // Redirect to checkout
      router.push('/checkout')
    } catch (error) {
      console.error('Error with buy now:', error)
      alert('Failed to proceed to checkout. Please try again.')
    } finally {
      setIsBuyingNow(false)
    }
  }


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
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-hemp-beige rounded-lg overflow-hidden relative">
              <Image
                src={product.image_url || product.image}
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

          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold text-hemp-green-dark mb-6">${product.price.toFixed(2)}</p>
            
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Features */}
            {product.features && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      selectedSize === size
                        ? 'bg-hemp-green-dark text-white border-hemp-green-dark'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-hemp-green-dark'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      selectedColor === color
                        ? 'bg-hemp-green-dark text-white border-hemp-green-dark'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-hemp-green-dark'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Selection Status */}
            {(!selectedSize || !selectedColor) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm font-medium">
                  Please select {!selectedSize && !selectedColor ? 'a size and color' : !selectedSize ? 'a size' : 'a color'} to continue.
                </p>
              </div>
            )}
            
            {/* Add to Cart and Buy Now Buttons */}
            <div className="space-y-4">
              {/* Main Action Buttons Row */}
              <div className="product-action-buttons flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor || isLoading}
                  className={`flex-1 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 min-h-[56px] ${
                    isAdded
                      ? 'bg-green-500 text-white'
                      : selectedSize && selectedColor && !isLoading
                      ? 'bg-hemp-green-dark text-white hover:bg-opacity-90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      Adding...
                    </>
                  ) : isAdded ? (
                    <>
                      <Check className="h-6 w-6" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6" />
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={!selectedSize || !selectedColor || isBuyingNow}
                  className={`flex-1 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 min-h-[56px] ${
                    selectedSize && selectedColor && !isBuyingNow
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isBuyingNow ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
              
              {/* Secondary Actions */}
              <div className="flex justify-center">
                <button className="btn-secondary px-6 py-3 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Add to Wishlist
                </button>
              </div>
            </div>

            {/* Product Info */}
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


        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Related Products</h2>
            <div className="product-grid">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
