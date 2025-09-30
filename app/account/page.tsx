'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Package, MapPin, CreditCard, Edit, Eye, Truck, LogIn, Plus, Trash2, Star, Calendar, DollarSign } from 'lucide-react'
import Layout from '@/components/Layout'
import AddressForm from '@/components/AddressForm'
import OrdersTab from '@/components/OrdersTab'
import { useAuth } from '@/lib/auth-context'
import { AddressAPI } from '@/lib/api/addresses'
import type { Address, CreateAddressRequest } from '@/lib/types/address'

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('account')
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // State for addresses management
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // Orders management is now handled by OrdersTab component

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Fetch user addresses
  const fetchAddresses = async () => {
    if (!isAuthenticated) return
    
    setAddressesLoading(true)
    setAddressesError('')
    
    try {
      const userAddresses = await AddressAPI.getAddresses()
      setAddresses(userAddresses)
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setAddressesError('Failed to load addresses')
    } finally {
      setAddressesLoading(false)
    }
  }

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      await AddressAPI.deleteAddress(addressId)
      setAddresses(addresses.filter(addr => addr.id !== addressId))
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('Failed to delete address')
    }
  }

  // Set default address
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await AddressAPI.setDefaultAddress(addressId)
      // Refresh addresses to reflect the change
      fetchAddresses()
    } catch (error) {
      console.error('Error setting default address:', error)
      alert('Failed to set default address')
    }
  }


  // Load addresses when user is authenticated
  useEffect(() => {
    if (isAuthenticated && activeTab === 'addresses') {
      fetchAddresses()
    }
  }, [isAuthenticated, activeTab])

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hemp-green-dark mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your account...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center max-w-md">
              <LogIn className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign In Required</h1>
              <p className="text-gray-600 mb-6">Please sign in to access your account.</p>
              <Link 
                href="/login" 
                className="bg-hemp-green-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-hemp-green-dark/90 transition-colors inline-block"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span>My Account</span>
        </div>

        {/* Mobile User Header */}
        <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-hemp-beige rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-hemp-green-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 truncate">{user?.name}</h2>
              <p className="text-sm text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-xl shadow-sm p-2">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                  activeTab === 'account' 
                    ? 'bg-hemp-green-dark text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Account
              </button>
              <Link
                href="/account/orders"
                className="px-3 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                <Package className="w-4 h-4 mr-2" />
                Orders
              </Link>
              <Link
                href="/account/address"
                className="px-3 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Addresses
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-hemp-beige rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-10 h-10 text-hemp-green-dark" />
                </div>
                <h2 className="font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                    activeTab === 'account' ? 'bg-hemp-green-light text-hemp-green-dark' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Account Details
                </button>
                
                <Link
                  href="/account/orders"
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center text-gray-600 hover:bg-gray-50"
                >
                  <Package className="w-5 h-5 mr-3" />
                  My Orders
                </Link>
                
                <Link
                  href="/account/address"
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center text-gray-600 hover:bg-gray-50"
                >
                  <MapPin className="w-5 h-5 mr-3" />
                  Addresses
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Account Details</h1>
                
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-gray-900">{user?.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                      <p className="text-gray-900 capitalize">{user?.role}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                      <p className="text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="btn-primary">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders and Addresses are now separate routes */}
          </div>
        </div>
      </div>
    </Layout>
  )
}
