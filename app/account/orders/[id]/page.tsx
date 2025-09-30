'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle, CreditCard, MapPin, User, Calendar } from 'lucide-react'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency, safeNumber, calculateSubtotal } from '@/lib/utils/format'

interface OrderItem {
  id: string
  productId: string
  name: string
  description: string
  image: string
  quantity: number
  price: number
  subtotal: number
}

interface OrderDetails {
  id: string
  total: number
  status: string
  createdAt: string
  customerEmail: string
  items: OrderItem[]
  payment: any
  summary: {
    subtotal: number
    total: number
    itemCount: number
  }
}

interface OrderPageProps {
  params: {
    id: string
  }
}

export default function OrderDetailsPage({ params }: OrderPageProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch order details
  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchOrderDetails()
    }
  }, [isAuthenticated, params.id])

  const fetchOrderDetails = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/orders/${params.id}/`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrder(data.data)
        } else {
          setError('Order not found')
        }
      } else if (response.status === 404) {
        setError('Order not found')
      } else {
        setError('Failed to load order details')
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'processing':
        return <Clock className="w-5 h-5" />
      case 'shipped':
        return <Truck className="w-5 h-5" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />
      case 'cancelled':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'paid':
      case 'processing':
        return 'text-yellow-600 bg-yellow-100'
      case 'shipped':
        return 'text-blue-600 bg-blue-100'
      case 'pending':
      case 'pending_payment':
        return 'text-orange-600 bg-orange-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'paid', label: 'Payment Confirmed', completed: ['paid', 'processing', 'shipped', 'delivered'].includes(status.toLowerCase()) },
      { key: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(status.toLowerCase()) },
      { key: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(status.toLowerCase()) },
      { key: 'delivered', label: 'Delivered', completed: status.toLowerCase() === 'delivered' }
    ]

    if (status.toLowerCase() === 'cancelled') {
      return [
        { key: 'pending', label: 'Order Placed', completed: true },
        { key: 'cancelled', label: 'Cancelled', completed: true }
      ]
    }

    return steps
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hemp-green-dark mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account" className="btn-secondary">
                View All Orders
              </Link>
              <Link href="/shop" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!order) {
    return null
  }

  const progressSteps = getProgressSteps(order.status)

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-6">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/account">Account</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Order #{order.id.slice(0, 8)}</span>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Order #{order.id.slice(0, 8)}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {order.customerEmail}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <span className={`px-3 py-2 rounded-lg text-sm font-medium capitalize flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span>{order.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>

          {/* Order Progress */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Progress</h3>
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                    step.completed 
                      ? 'bg-hemp-green-dark text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${step.completed ? 'text-hemp-green-dark' : 'text-gray-600'}`}>
                      {step.label}
                    </p>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-0.5 ml-6 ${
                      step.completed ? 'bg-hemp-green-dark' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            {/* Mobile step labels */}
            <div className="sm:hidden mt-4 grid grid-cols-2 gap-2 text-xs text-center">
              {progressSteps.map((step) => (
                <div key={step.key} className={step.completed ? 'text-hemp-green-dark font-medium' : 'text-gray-600'}>
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                    <div className="w-20 h-20 bg-hemp-beige rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/shop/${item.productId}`} className="block">
                        <h3 className="font-semibold text-gray-800 hover:text-hemp-green-dark transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{formatCurrency(item.subtotal)}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({order.summary.itemCount} items)</span>
                  <span>{formatCurrency(order.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-hemp-green-dark font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(safeNumber(order.summary.total) - safeNumber(order.summary.subtotal))}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {order.payment && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-gray-600">Payment Method</span>
                    </div>
                    <span className="font-medium capitalize">{order.payment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">{formatCurrency(order.payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-green-600 capitalize">{order.payment.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
          <Link href="/account/orders" className="btn-secondary w-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </Link>
              {order.status.toLowerCase() === 'shipped' && (
                <button className="btn-primary w-full flex items-center justify-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Track Package
                </button>
              )}
              <Link href="/shop" className="btn-secondary w-full flex items-center justify-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
