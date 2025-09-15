// Category Service for Hemp Fashion E-commerce
// This service handles all category data operations via backend API

import { apiService } from '@/lib/api-service'

export interface Category {
  id: string
  name: string
  description: string
  productCount: number
  createdAt: string
}

export class CategoryService {
  
  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get('/categories')
      return response.data || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Create new category (admin only)
  async createCategory(data: {
    name: string
    description?: string
  }): Promise<Category | null> {
    try {
      const response = await apiService.post('/categories', data)
      return response.data || null
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }
}

// Export singleton instance
export const categoryService = new CategoryService()
