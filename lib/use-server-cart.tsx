'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
  stock?: number
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  loading: boolean
  error: string | null
}

interface CartContextType extends CartState {
  addItem: (product: {
    productId: string
    name: string
    price: number
    image: string
    size: string
    color: string
  }, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const ServerCartContext = createContext<CartContextType | undefined>(undefined)

export function ServerCartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [state, setState] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0,
    loading: true,
    error: null
  })

  // Refresh cart from server
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, items: [], total: 0, itemCount: 0, loading: false, error: null }))
      return
    }

    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setState(prev => ({
            ...prev,
            items: data.data.items || [],
            total: data.data.total || 0,
            itemCount: data.data.itemCount || 0,
            loading: false,
            error: null
          }))
        } else {
          setState(prev => ({ ...prev, loading: false, error: data.error || 'Failed to load cart' }))
        }
      } else {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to load cart' }))
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load cart' }))
    }
  }, [isAuthenticated])

  // Load cart when auth state changes
  useEffect(() => {
    if (!authLoading) {
      refreshCart()
    }
  }, [authLoading, isAuthenticated, refreshCart])

  // Add item to cart
  const addItem = async (product: {
    productId: string
    name: string
    price: number
    image: string
    size: string
    color: string
  }, quantity = 1) => {
    if (!isAuthenticated) {
      setState(prev => ({ ...prev, error: 'Please log in to add items to cart' }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product.productId,
          quantity,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState(prev => ({
          ...prev,
          items: data.data.items || [],
          total: data.data.total || 0,
          itemCount: data.data.itemCount || 0,
          loading: false,
          error: null
        }))
      } else {
        setState(prev => ({ ...prev, loading: false, error: data.error || 'Failed to add item to cart' }))
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setState(prev => ({ ...prev, loading: false, error: 'Failed to add item to cart' }))
    }
  }

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) return

    // Find the product ID from the item ID
    const item = state.items.find(i => i.id === itemId)
    if (!item) {
      setState(prev => ({ ...prev, error: 'Item not found in cart' }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId: item.productId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState(prev => ({
          ...prev,
          items: data.data.items || [],
          total: data.data.total || 0,
          itemCount: data.data.itemCount || 0,
          loading: false,
          error: null
        }))
      } else {
        setState(prev => ({ ...prev, loading: false, error: data.error || 'Failed to remove item from cart' }))
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      setState(prev => ({ ...prev, loading: false, error: 'Failed to remove item from cart' }))
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) return

    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    // Find the product ID from the item ID
    const item = state.items.find(i => i.id === itemId)
    if (!item) {
      setState(prev => ({ ...prev, error: 'Item not found in cart' }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId: item.productId, quantity }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState(prev => ({
          ...prev,
          items: data.data.items || [],
          total: data.data.total || 0,
          itemCount: data.data.itemCount || 0,
          loading: false,
          error: null
        }))
      } else {
        setState(prev => ({ ...prev, loading: false, error: data.error || 'Failed to update cart' }))
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      setState(prev => ({ ...prev, loading: false, error: 'Failed to update cart' }))
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/cart/clear', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        setState(prev => ({
          ...prev,
          items: [],
          total: 0,
          itemCount: 0,
          loading: false,
          error: null
        }))
      } else {
        setState(prev => ({ ...prev, loading: false, error: 'Failed to clear cart' }))
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      setState(prev => ({ ...prev, loading: false, error: 'Failed to clear cart' }))
    }
  }

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart
  }

  return (
    <ServerCartContext.Provider value={value}>
      {children}
    </ServerCartContext.Provider>
  )
}

export function useServerCart() {
  const context = useContext(ServerCartContext)
  if (context === undefined) {
    throw new Error('useServerCart must be used within a ServerCartProvider')
  }
  return context
}