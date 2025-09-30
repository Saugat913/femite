'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, Eye, Truck, Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface OrderItem {
  id: string
  productId: string
  name: string
  image?: string
  quantity: number
  price: number
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  itemCount: number
  items: OrderItem[]
  stripeSessionId?: string
  trackingNumber?: string
  notes?: string
}

interface OrdersResponse {
  success: boolean
  data: {
    orders: Order[]
    pagination: {
      page: number
      limit: number
      total: number
      hasMore: boolean
    }
  }
}

export default function OrdersTab() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchOrders = async (pageNum: number = 1) => {
    if (!isAuthenticated) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/orders?page=${pageNum}&limit=10`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data: OrdersResponse = await response.json()
        if (data.success) {
          if (pageNum === 1) {
            setOrders(data.data.orders)
          } else {
            setOrders(prev => [...prev, ...data.data.orders])
          }
          setHasMore(data.data.pagination.hasMore)
          setPage(pageNum)
        } else {
          setError('Failed to load orders')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load orders')
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Network error occurred while loading orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(1)
  }, [isAuthenticated])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const loadMore = () => {
    fetchOrders(page + 1)
  }

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Orders</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hemp-green-dark mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Orders</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => fetchOrders(1)}
            className="mt-2 text-red-600 hover:underline text-sm font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link href="/shop" className="btn-primary w-full sm:w-auto">
            Start Shopping
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Order Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      {getStatusIcon(order.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Tracking:</span> {order.trackingNumber}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="font-bold text-lg text-gray-800">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-3">
                      {item.image && (
                        <div className="flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover border"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Note:</span> {order.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Actions */}
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    href={`/orders/${order.id}`}
                    className="flex-1 bg-hemp-green-light text-hemp-green-dark py-2 px-4 rounded-lg text-sm font-medium hover:bg-hemp-green-light/80 transition-colors text-center flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                  
                  {order.status === 'shipped' && (
                    <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center">
                      <Truck className="w-4 h-4 mr-2" />
                      Track Package
                    </button>
                  )}
                  
                  {(order.status === 'paid' || order.status === 'delivered') && (
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-hemp-green-light text-hemp-green-dark py-3 px-6 rounded-lg font-medium hover:bg-hemp-green-light/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More Orders'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}