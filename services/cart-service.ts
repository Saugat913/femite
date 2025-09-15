// Cart Service for Hemp Fashion E-commerce
// This service handles cart operations with backend API integration
// Uses cookie-based session authentication

import { apiService } from '@/lib/api-service'
import { API_CONFIG } from '@/lib/api-config'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

export interface AddToCartRequest {
  productId: string
  quantity: number
  size?: string
  color?: string
}

export interface CartResponse {
  items: CartItem[]
  total: number
  itemCount: number
}

export class CartService {
  // Add item to cart
  async addToCart(item: AddToCartRequest): Promise<CartResponse | null> {
    try {
      const response = await apiService.post<CartResponse>(
        API_CONFIG.ENDPOINTS.CART.ADD,
        item
      )
      
      if (response.success) {
        return response.data || null
      }
      
      throw new Error(response.message || 'Failed to add item to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  // Get cart contents
  async getCart(): Promise<CartResponse | null> {
    try {
      const response = await apiService.get<CartResponse>(
        API_CONFIG.ENDPOINTS.CART.GET
      )
      
      if (response.success) {
        return response.data || null
      }
      
      throw new Error(response.message || 'Failed to get cart')
    } catch (error) {
      console.error('Error getting cart:', error)
      throw error
    }
  }

  // Update cart item quantity
  async updateCartItem(productId: string, quantity: number): Promise<CartResponse | null> {
    try {
      const response = await apiService.post<CartResponse>(
        API_CONFIG.ENDPOINTS.CART.UPDATE,
        { productId, quantity }
      )
      
      if (response.success) {
        return response.data || null
      }
      
      throw new Error(response.message || 'Failed to update cart item')
    } catch (error) {
      console.error('Error updating cart item:', error)
      throw error
    }
  }

  // Remove item from cart
  async removeFromCart(productId: string): Promise<CartResponse | null> {
    try {
      const response = await apiService.post<CartResponse>(
        API_CONFIG.ENDPOINTS.CART.REMOVE,
        { productId }
      )
      
      if (response.success) {
        return response.data || null
      }
      
      throw new Error(response.message || 'Failed to remove item from cart')
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    }
  }

  // Clear entire cart
  async clearCart(): Promise<boolean> {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.CART.CLEAR
      )
      
      return response.success || false
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    }
  }
}

// Export singleton instance
export const cartService = new CartService()
