import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressResponse,
  AddressListResponse,
  DeleteAddressResponse
} from '@/lib/types/address'

const API_BASE = '/api/addresses'

export class AddressAPI {
  /**
   * Get all addresses for the current user
   */
  static async getAddresses(type?: 'shipping' | 'billing' | 'both'): Promise<Address[]> {
    const url = new URL(API_BASE, window.location.origin)
    if (type) {
      url.searchParams.set('type', type)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch addresses: ${response.statusText}`)
    }

    const data: AddressListResponse = await response.json()
    if (!data.success) {
      throw new Error('Failed to fetch addresses')
    }

    return data.data
  }

  /**
   * Get a specific address by ID
   */
  static async getAddress(id: string): Promise<Address> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch address: ${response.statusText}`)
    }

    const data: AddressResponse = await response.json()
    if (!data.success) {
      throw new Error('Failed to fetch address')
    }

    return data.data
  }

  /**
   * Create a new address
   */
  static async createAddress(addressData: CreateAddressRequest): Promise<Address> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to create address: ${response.statusText}`)
    }

    const data: AddressResponse = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to create address')
    }

    return data.data
  }

  /**
   * Update an existing address
   */
  static async updateAddress(id: string, addressData: UpdateAddressRequest): Promise<Address> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to update address: ${response.statusText}`)
    }

    const data: AddressResponse = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to update address')
    }

    return data.data
  }

  /**
   * Delete an address
   */
  static async deleteAddress(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to delete address: ${response.statusText}`)
    }

    const data: DeleteAddressResponse = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete address')
    }
  }

  /**
   * Set an address as default
   */
  static async setDefaultAddress(id: string): Promise<Address> {
    const response = await fetch(`${API_BASE}/${id}/default`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to set default address: ${response.statusText}`)
    }

    const data: AddressResponse = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to set default address')
    }

    return data.data
  }

  /**
   * Get the default address for a specific type
   */
  static async getDefaultAddress(type: 'shipping' | 'billing' | 'both'): Promise<Address | null> {
    const addresses = await this.getAddresses(type)
    return addresses.find(addr => addr.isDefault) || null
  }

  /**
   * Format address for display
   */
  static formatAddress(address: Address): string {
    const lines = [
      address.name,
      address.company,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country !== 'US' ? address.country : null
    ].filter(Boolean)

    return lines.join('\n')
  }

  /**
   * Format address for single line display
   */
  static formatAddressSingleLine(address: Address): string {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean)

    return parts.join(', ')
  }

  /**
   * Validate address data before sending to API
   */
  static validateAddress(address: CreateAddressRequest | UpdateAddressRequest): string[] {
    const errors: string[] = []

    if ('name' in address && address.name !== undefined && !address.name?.trim()) {
      errors.push('Name is required')
    }

    if ('addressLine1' in address && address.addressLine1 !== undefined && !address.addressLine1?.trim()) {
      errors.push('Address line 1 is required')
    }

    if ('city' in address && address.city !== undefined && !address.city?.trim()) {
      errors.push('City is required')
    }

    if ('state' in address && address.state !== undefined && !address.state?.trim()) {
      errors.push('State is required')
    }

    if ('zipCode' in address && address.zipCode !== undefined && !address.zipCode?.trim()) {
      errors.push('ZIP code is required')
    }

    // Validate ZIP code format for US addresses
    if (address.country === 'US' || !address.country) {
      const zipCode = address.zipCode?.trim()
      if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
        errors.push('ZIP code must be in format 12345 or 12345-6789')
      }
    }

    // Validate phone number format (optional)
    if (address.phone && address.phone.trim()) {
      const phone = address.phone.replace(/\D/g, '')
      if (phone.length !== 10) {
        errors.push('Phone number must be 10 digits')
      }
    }

    return errors
  }
}
