'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '@/lib/types/address'
import { US_STATES } from '@/lib/types/address'
import { AddressAPI } from '@/lib/api/addresses'

interface AddressFormProps {
  address?: Address | null
  onSave: (addressData: CreateAddressRequest | UpdateAddressRequest) => Promise<void>
  onCancel: () => void
}

export default function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState({
    type: 'shipping' as 'shipping' | 'billing' | 'both',
    name: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    isDefault: false
  })

  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-populate form if editing an existing address
  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type,
        name: address.name,
        company: address.company || '',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone || '',
        isDefault: address.isDefault
      })
    }
  }, [address])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = AddressAPI.validateAddress(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setErrors([])

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error in form submission:', error)
      setErrors(['Failed to save address. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {address ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="text-red-600 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company (Optional)
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              required
              placeholder="Street address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
              placeholder="12345 or 12345-6789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark"
            />
          </div>

          {/* Default Address */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="h-4 w-4 text-hemp-green-dark focus:ring-hemp-green-dark border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Set as default {formData.type} address
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-hemp-green-dark text-white rounded-lg hover:bg-hemp-green-dark/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (address ? 'Update Address' : 'Save Address')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
