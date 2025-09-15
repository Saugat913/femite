'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Package, Truck, Home } from 'lucide-react'
import Layout from '@/components/Layout'

export default function OrderConfirmationPage() {
  // Mock order data - in a real app, this would come from the server or state
  const orderData = {
    orderNumber: '#123456789',
    estimatedDelivery: 'June 15, 2024',
    total: 134.97,
    items: [
      {
        id: '1',
        name: 'Hemp Essential Tee',
        size: 'M',
        color: 'Natural',
        quantity: 1,
        price: 35,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAESP9ENW1WUbMsoK771nAHQ_S2hN0D_W4CRJEHPrswGs5gSl9iXfT2PBzg6jNImbNZzxPpWNXwc9Ec-DFgADvZdvjeyFetNUM4u7KDBpTFNJtjqd5abYVknBpb2CxJbpdllgXBPINVXNbfpiTtt9mx0bMZv8m-84iMS2Qe6Gss1Y3ZmSqGpUblO-Qk9jFghjwawcS3abd7o4podbLoOdUGnryC5nXVY7H61BVWHkgL6IiQ7Zzo2R-chptO4X2JfaNnvil-D803BWQ'
      },
      {
        id: '2',
        name: 'Organic Hemp Hoodie',
        size: 'L',
        color: 'Forest Green',
        quantity: 1,
        price: 75,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdUeRKFjZENlArq6oABk784uUeGdInsRNS_JlSO4XNQnliKAaW0Auj6kPVUn6nnHXWrmv8xhsrqptC4BLUsAb2orVk2prfiwkRsLXy_RavXuEjiJUYUJyreJAVhwKOQaIuaqCw0jE0t92eDMp_VfgGjBYIffLT5CI-ufSR3dTxwF0w2zdciMqIbCvl-beUbg49nrSUjLcrufw24vFiZF6DmDM5PWuzMOIr2F95hFgoAg-ym5G2Jhx7-cTq20uVxy9YEtt63UmqS3M'
      }
    ],
    shippingAddress: '123 Main Street, Anytown, USA'
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-hemp-green-dark rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order! We've received it and will send you a confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500">
              Your order has been placed and is being processed. You will receive an email confirmation shortly.
            </p>
          </div>

          {/* Order Summary */}
          <div className="card card-padding mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-semibold text-gray-800">{orderData.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Estimated Delivery</span>
                  <span className="font-semibold text-gray-800">{orderData.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold text-gray-800">Credit Card</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping Address</span>
                </div>
                <p className="text-sm text-gray-600">{orderData.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="card card-padding mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Items</h3>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-hemp-beige rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.size} • {item.color}</p>
                    <p className="text-sm text-gray-600">{item.quantity} x ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-hemp-green-dark">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${(orderData.total / 1.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-hemp-green-dark font-medium">$5.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${(orderData.total * 0.08 / 1.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>${orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="card card-padding mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Order Status</h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-hemp-green-dark rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800">Order Placed</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              
              <div className="flex-1 h-px bg-gray-200 mx-4"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-xs text-gray-500">1-2 days</p>
              </div>
              
              <div className="flex-1 h-px bg-gray-200 mx-4"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Truck className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Shipped</p>
                <p className="text-xs text-gray-500">3-5 days</p>
              </div>
              
              <div className="flex-1 h-px bg-gray-200 mx-4"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Home className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-xs text-gray-500">5-7 days</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-hemp-beige rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">What's Next?</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-hemp-green-dark rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>You'll receive an email confirmation with your order details and tracking information.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-hemp-green-dark rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Your order will be processed within 1-2 business days.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-hemp-green-dark rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Once shipped, you'll receive tracking information to monitor your package.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/account" className="btn-primary">
              View Order Details
            </Link>
            <Link href="/shop" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
