'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useServerCart } from '@/lib/use-server-cart'
import { cartService } from '@/services/cart-service'
import { ShoppingCart, Check, Plus, Minus, Heart, Zap } from 'lucide-react'
import type { Product } from '@/types'

interface ProductClientProps {
  product: Product
}

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter()
  const { addItem } = useServerCart()
  
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)

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
        image: product.image,
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
        image: product.image,
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
    <>
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
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
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
    </>
  )
}