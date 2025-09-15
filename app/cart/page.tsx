'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, X, ArrowRight, ShoppingBag } from 'lucide-react'
import Layout from '@/components/Layout'
import { useCart } from '@/lib/cart-context'

export default function Cart() {
  const { items, total, removeItem, updateQuantity, itemCount, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-hemp-beige mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-hemp-green-dark" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some sustainable hemp clothing to get started!</p>
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Your Cart</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
              <button
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="card card-padding">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-hemp-beige overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                      <div className="text-sm text-gray-600 mb-2">
                        <span>{item.size}</span>
                        {item.color && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{item.color}</span>
                          </>
                        )}
                      </div>
                      <p className="font-semibold text-hemp-green-dark">${item.price.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-center w-8 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card card-padding sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-hemp-green-dark font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>${(total * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full mb-4">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <Link href="/shop" className="btn-secondary w-full">
                Continue Shopping
              </Link>

              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-hemp-beige">
                <h3 className="font-semibold text-gray-800 mb-2">Free Shipping</h3>
                <p className="text-sm text-gray-600">
                  Enjoy free standard shipping on all orders. Your items will be carefully packaged and delivered to your door.
                </p>
              </div>

              {/* Return Policy */}
              <div className="mt-4 p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2">30-Day Returns</h3>
                <p className="text-sm text-gray-600">
                  Not completely satisfied? Return your items within 30 days for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
