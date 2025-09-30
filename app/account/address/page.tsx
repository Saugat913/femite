'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Plus, Trash2, Edit } from 'lucide-react'
import Layout from '@/components/Layout'
import AddressForm from '@/components/AddressForm'
import { useAuth } from '@/lib/auth-context'
import { AddressAPI } from '@/lib/api/addresses'
import type { Address, CreateAddressRequest } from '@/lib/types/address'

export default function AccountAddressPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  // State for addresses management
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

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

  // Load addresses when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses()
    }
  }, [isAuthenticated])

  // Show loading state
  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hemp-green-dark mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
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
          <Link href="/account">Account</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Addresses</span>
        </div>

        <div className="mt-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Addresses</h1>
            <button 
              onClick={() => {
                setEditingAddress(null)
                setShowAddressForm(true)
              }}
              className="btn-primary self-start sm:self-auto flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add New Address</span>
              <span className="sm:hidden">Add Address</span>
            </button>
          </div>

          {addressesLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hemp-green-dark mx-auto mb-4"></div>
              <p className="text-gray-600">Loading addresses...</p>
            </div>
          )}

          {addressesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{addressesError}</p>
            </div>
          )}

          {!addressesLoading && !addressesError && addresses.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Addresses</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
                You haven't added any addresses yet. Add one to make checkout faster.
              </p>
              <button 
                onClick={() => {
                  setEditingAddress(null)
                  setShowAddressForm(true)
                }}
                className="btn-primary w-full sm:w-auto flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </button>
            </div>
          )}

          {!addressesLoading && addresses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800 capitalize">
                        {address.type === 'both' ? 'Shipping & Billing' : address.type}
                      </h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-hemp-green-light text-hemp-green-dark text-xs rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setEditingAddress(address)
                          setShowAddressForm(true)
                        }}
                        className="text-hemp-green-dark hover:underline text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-800">{address.name}</p>
                    {address.company && <p className="text-gray-600">{address.company}</p>}
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    {address.country !== 'US' && <p>{address.country}</p>}
                    {address.phone && <p>{address.phone}</p>}
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="sm:hidden mt-4 pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingAddress(address)
                          setShowAddressForm(true)
                        }}
                        className="flex-1 bg-hemp-green-light text-hemp-green-dark py-2 px-3 rounded-lg text-sm font-medium hover:bg-hemp-green-light/80 transition-colors"
                      >
                        Edit Address
                      </button>
                      {!address.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop Set Default Button */}
                  <div className="hidden sm:block mt-4">
                    {!address.isDefault && (
                      <button 
                        onClick={() => handleSetDefaultAddress(address.id)}
                        className="text-sm text-hemp-green-dark hover:underline font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Address Form Modal/Overlay */}
          {showAddressForm && (
            <AddressForm 
              address={editingAddress}
              onSave={async (addressData) => {
                try {
                  if (editingAddress) {
                    await AddressAPI.updateAddress(editingAddress.id, addressData)
                  } else {
                    // Type assertion since form data contains all required fields for creation
                    await AddressAPI.createAddress(addressData as CreateAddressRequest)
                  }
                  setShowAddressForm(false)
                  setEditingAddress(null)
                  fetchAddresses() // Refresh the addresses list
                } catch (error) {
                  console.error('Error saving address:', error)
                  alert('Failed to save address')
                }
              }}
              onCancel={() => {
                setShowAddressForm(false)
                setEditingAddress(null)
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}