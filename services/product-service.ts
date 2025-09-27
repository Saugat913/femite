// Product Service for Hemp Fashion E-commerce
// This service handles all product data operations via backend API and direct DB access

import { apiService } from '@/lib/api-service'
import { API_CONFIG } from '@/lib/api-config'
import type { Product } from '@/types'

// Dynamic import for server-side database access to avoid client bundle issues
const getDbQuery = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('Database access not available on client side')
  }
  const { query } = await import('@/lib/db')
  return query
}

export class ProductService {
  // Smart service - uses direct DB for SSR, API for CSR
  private useApi = typeof window !== 'undefined'

  // Helper to get a valid image URL
  private getValidImageUrl(imageUrl: string | null): string {
    if (!imageUrl) return '/placeholder-image.jpg'
    
    // List of known broken image URLs to replace
    const brokenUrls = [
      'https://images.unsplash.com/photo-1506629905607-45e135278531',
      'photo-1506629905607-45e135278531' // partial match
    ]
    
    // Check if the image URL is broken
    const isBroken = brokenUrls.some(broken => imageUrl.includes(broken))
    
    if (isBroken) {
      // Replace with a working hemp/clothing image
      return 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop&crop=center'
    }
    
    return imageUrl
  }

  // Format database products for frontend
  private formatProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      stock: product.stock,
      image: this.getValidImageUrl(product.image_url || product.image),
      category: product.categories ? product.categories.split(', ')[0] || 'Uncategorized' : 'Uncategorized',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Natural', 'Forest Green', 'Earth Brown', 'Sage Green', 'Charcoal'],
      features: ['UV Protection', 'Moisture Control', 'Durable Fabric', 'Antimicrobial', '100% Organic'],
      isNew: false,
      createdAt: product.created_at
    }
  }

  // Get products from database directly (SSR)
  private async getProductsFromDB(options: {
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
      const query = await getDbQuery()
      const { page = 1, limit = 12, category, search } = options
      const offset = (page - 1) * limit
      
      let queryText = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.image_url,
          p.created_at,
          COALESCE(
            STRING_AGG(DISTINCT c.name, ', '),
            'Uncategorized'
          ) as categories
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE 1=1
      `
      const queryParams: any[] = []

      if (category) {
        queryParams.push(category)
        queryText += ` AND c.name ILIKE $${queryParams.length}`
      }

      if (search) {
        queryParams.push(`%${search}%`)
        queryText += ` AND (p.name ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`
      }

      queryText += ` GROUP BY p.id, p.name, p.description, p.price, p.stock, p.image_url, p.created_at`
      queryText += ` ORDER BY p.created_at DESC`
      
      queryParams.push(limit, offset)
      queryText += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`

      const result = await query(queryText, queryParams)
      const products = result.rows.map(row => this.formatProduct(row))

      return {
        products,
        total: products.length, // Note: This is a simplified total count
        page,
        limit,
        hasMore: products.length === limit
      }
    } catch (error) {
      console.error('Database query error:', error)
      return {
        products: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 12,
        hasMore: false
      }
    }
  }

  // Get single product from database (SSR)
  private async getProductFromDB(id: string): Promise<Product | null> {
    try {
      const query = await getDbQuery()
      const queryText = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.image_url,
          p.created_at,
          COALESCE(
            STRING_AGG(DISTINCT c.name, ', '),
            'Uncategorized'
          ) as categories
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.id = $1
        GROUP BY p.id, p.name, p.description, p.price, p.stock, p.image_url, p.created_at
      `
      
      const result = await query(queryText, [id])
      return result.rows.length > 0 ? this.formatProduct(result.rows[0]) : null
    } catch (error) {
      console.error('Database query error:', error)
      return null
    }
  }

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
    // For server-side rendering, use direct database access
    if (typeof window === 'undefined') {
      return this.getProductsFromDB({
        page: options.page,
        limit: options.limit,
        category: options.category,
        search: options.search
      })
    }
    
    // For client-side, use API
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
    // For server-side rendering, use direct database access
    if (typeof window === 'undefined') {
      return this.getProductFromDB(id)
    }
    
    // For client-side, use API
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
    const result = await this.getProducts({ limit })
    return result.products
  }

  // Search products
  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    // For search, always use API since it's typically client-side
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
      const result = await this.getProducts({ 
        category: currentProduct.category, 
        limit: limit + 1 
      })
      
      // Filter out the current product
      return result.products.filter(p => p.id !== productId).slice(0, limit)
    } catch (error) {
      console.error('Error fetching related products:', error)
      return []
    }
  }
}

// Export singleton instance
export const productService = new ProductService()
