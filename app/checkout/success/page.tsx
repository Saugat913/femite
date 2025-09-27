'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import Layout from '@/components/Layout'
import { useServerCart } from '@/lib/use-server-cart'

interface OrderDetails {
  id: string
  total: number
  status: string
  created_at: string
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const { clearCart } = useServerCart()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails()
      // Clear the cart after successful payment
      clearCart()
    }
  }, [sessionId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/checkout/session-details?session_id=${sessionId}`, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrderDetails(data.data)
        } else {
          setError('Unable to load order details')
        }
      }
    } catch (err) {
      console.error('Error fetching order details:', err)
      setError('Unable to load order details')
    } finally {
      setLoading(false)
    }
  }

  if (!sessionId) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-red-500 mb-4">
              <Package className="w-16 h-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Session</h1>
            <p className="text-gray-600 mb-8">
              No valid checkout session found. Please try again.
            </p>
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
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {loading ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hemp-green-dark mx-auto mb-6"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          ) : error ? (
            <div>
              <div className="text-red-500 mb-6">
                <Package className="w-16 h-16 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/account" className="btn-secondary">
                  View My Orders
                </Link>
                <Link href="/shop" className="btn-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Success Icon */}
              <div className="text-hemp-green-dark mb-6">
                <CheckCircle className="w-16 h-16 mx-auto" />
              </div>

              {/* Success Message */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your purchase. Your order has been confirmed and we're processing it now.
              </p>

              {/* Order Details */}
              {orderDetails && (
                <div className="bg-hemp-green-light/20 border border-hemp-green-light rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-hemp-green-dark mb-4">Order Details</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium text-gray-800">#{orderDetails.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-gray-800">${orderDetails.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600 capitalize">{orderDetails.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-800">
                        {new Date(orderDetails.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-hemp-green-dark rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You'll receive an order confirmation email shortly</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-hemp-green-dark rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>We'll send you a shipping notification when your order is on its way</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-hemp-green-dark rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Track your order status anytime in your account</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/account" className="btn-secondary flex items-center justify-center">
                  <Package className="w-5 h-5 mr-2" />
                  View My Orders
                </Link>
                <Link href="/" className="btn-primary flex items-center justify-center">
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
              </div>

              {/* Continue Shopping */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Discover More Sustainable Products
                </h3>
                <Link 
                  href="/shop" 
                  className="inline-flex items-center text-hemp-green-dark font-medium hover:underline"
                >
                  Continue Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
