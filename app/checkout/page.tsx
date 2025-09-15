'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Lock, Loader2 } from 'lucide-react'
import Layout from '@/components/Layout'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'

interface FormData {
  // Shipping Info
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  // Payment Info
  cardNumber: string
  expiryDate: string
  cvc: string
  cardName: string
  billingAddress: string
  billingCity: string
  billingState: string
  billingZipCode: string
}

export default function CheckoutPage() {
  const { items, total, itemCount } = useCart()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Shipping, 2: Stripe Checkout
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const handleStripeCheckout = async () => {
    setLoading(true)
    setError('')
    
    try {
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
      }

      const checkoutItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))

      const response = await fetch('/api/checkout/create-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: checkoutItems,
          shipping_address: shippingAddress,
        }),
      })

      const data = await response.json()

      if (data.success && data.data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hemp-green-dark mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    )
  }

  if (itemCount === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <Link href="/shop" className="btn-primary">
            Continue Shopping
          </Link>
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
          <Link href="/cart">Cart</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="order-2 lg:order-1">
            {/* Step Indicator */}
            <div className="flex items-center mb-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-hemp-green-dark text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm text-gray-600">Shipping</span>
              </div>
              <div className="w-12 h-px bg-gray-200 mx-4"></div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-hemp-green-dark text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm text-gray-600">Payment</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div>
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Shipping Information</h2>
                  
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={user?.email || formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="form-input"
                      placeholder={user?.email || "Enter your email"}
                      readOnly={!!user?.email}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="form-input"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="form-input"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="form-input"
                      placeholder="Enter your address"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="form-input"
                      placeholder="Enter your city"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">State</label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select State</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        {/* Add more states as needed */}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="form-input"
                        placeholder="Enter your zip code"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="form-input"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div className="flex justify-between">
                    <Link href="/cart" className="btn-secondary">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to Cart
                    </Link>
                    <button type="button" onClick={handleNextStep} className="btn-primary">
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Stripe Checkout */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Secure Payment with Stripe</h2>
                  
                  <div className="card card-padding">
                    <h3 className="font-semibold text-gray-800 mb-4">Shipping Information</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                      <p>{formData.phone}</p>
                    </div>
                  </div>

                  <div className="bg-hemp-green-light/20 border border-hemp-green-light rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <Lock className="w-5 h-5 text-hemp-green-dark mr-2" />
                      <h3 className="font-semibold text-hemp-green-dark">Secure Payment</h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      You'll be redirected to Stripe's secure checkout to complete your payment. 
                      All payment information is processed securely and encrypted.
                    </p>
                    <div className="flex items-center text-xs text-gray-600">
                      <CreditCard className="w-4 h-4 mr-1" />
                      <span>Accepts all major credit cards</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button type="button" onClick={handlePrevStep} className="btn-secondary">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to Shipping
                    </button>
                    <button 
                      type="button" 
                      onClick={handleStripeCheckout}
                      disabled={loading}
                      className="btn-primary flex items-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          Proceed to Payment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-1 lg:order-2">
            <div className="card card-padding sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-hemp-beige rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                      <p className="text-xs text-gray-600">{item.size} • {item.color}</p>
                      <p className="text-sm font-medium text-hemp-green-dark">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
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
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>${(total * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
