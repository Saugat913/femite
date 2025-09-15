// Product Service for Hemp Fashion E-commerce
// This service handles all product data operations via backend API

import { apiService } from '@/lib/api-service'
import { API_CONFIG } from '@/lib/api-config'
import type { Product } from '@/types'

export class ProductService {
  // Always use API - no more static data fallbacks
  private useApi = true

  // Get all products with pagination and filters
  async getProducts(options: {
    page?: number
    limit?: number
    category?: string
    collection?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    sizes?: string[]
    colors?: string[]
    sort?: string
    order?: 'asc' | 'desc'
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
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','))
          } else {
            queryParams.append(key, String(value))
          }
        }
      })

      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`)
      
      // Handle the response from our Next.js API
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

  // Get single product by ID
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

  // Get featured products
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?limit=${limit}`)
      return response.data?.products || response.data || []
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  }

  // Search products
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

  // Get product categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiService.get('/categories')
      const categories = response.data || []
      return categories.map((cat: any) => cat.name || cat)
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Get products by category
  async getProductsByCategory(category: string, limit?: number): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams({ category })
      if (limit) queryParams.append('limit', String(limit))
      
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`)
      return response.data?.products || response.data || []
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  }

  // Get related products (same category, excluding current product)
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      // First get the current product to know its category
      const currentProduct = await this.getProduct(productId)
      if (!currentProduct) return []
      
      // Get products from same category
      const response = await apiService.get(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?category=${encodeURIComponent(currentProduct.category)}&limit=${limit + 1}`
      )
      
      const products = response.data?.products || response.data || []
      // Filter out the current product
      return products.filter((p: Product) => p.id !== productId).slice(0, limit)
    } catch (error) {
      console.error('Error fetching related products:', error)
      return []
    }
  }
}

// Export singleton instance
export const productService = new ProductService()
