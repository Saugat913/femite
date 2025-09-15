'use client'

import React, { createContext, useContext, useReducer } from 'react'
import { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  total: number
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

type CartAction = 
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'quantity'>; quantity?: number }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const quantityToAdd = action.quantity || 1
      const existingItem = state.items.find(
        item => 
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      )

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        )
        return {
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      }

      const newItem: CartItem = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        quantity: quantityToAdd
      }

      const newItems = [...state.items, newItem]
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload)
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0)

      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'CLEAR_CART':
      return { items: [], total: 0 }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  const addItem = (item: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: item, quantity })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
