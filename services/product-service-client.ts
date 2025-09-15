// Client-only Product Service for Hemp Fashion E-commerce
// This service handles product operations from the client-side only

import { apiService } from '@/lib/api-service'
import { API_CONFIG } from '@/lib/api-config'
import type { Product } from '@/types'

export class ClientProductService {
  // Search products (client-side only)
  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    try {
      const response = await apiService.get(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?search=${encodeURIComponent(query)}&limit=${limit}`
      )
      return response.data?.products || response.data || []
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  // Get all products (client-side only)
  async getProducts(options: {
    page?: number
    limit?: number
    category?: string
    search?: string
  } = {}): Promise<{
    products: Product[]
    total: number
    page: number
    limit: number
    hasMore: boolean
  }> {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`)
      
      const products = response.data?.products || response.data || []
      const total = response.data?.total || products.length
      
      return {
        products,
        total,
        page: options.page || 1,
        limit: options.limit || 12,
        hasMore: total > (options.page || 1) * (options.limit || 12)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        products: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 12,
        hasMore: false
      }
    }
  }

  // Get single product (client-side only)
  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await apiService.get(
        API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL.replace(':id', id)
      )
      return response.data?.product || response.data || null
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }
}

// Export singleton instance
export const clientProductService = new ClientProductService()