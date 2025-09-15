'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Product } from '@/types'
import { clientProductService } from '@/services/product-service-client'

interface SearchState {
  query: string
  results: Product[]
  isSearching: boolean
  filters: {
    category: string
    priceRange: [number, number]
    sizes: string[]
    colors: string[]
  }
}

interface SearchContextType extends SearchState {
  search: (query: string) => void
  clearSearch: () => void
  setFilter: (key: keyof SearchState['filters'], value: any) => void
  clearFilters: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const initialFilters = {
  category: '',
  priceRange: [0, 200] as [number, number],
  sizes: [] as string[],
  colors: [] as string[]
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isSearching: false,
    filters: initialFilters
  })

  const search = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, query, isSearching: true }))
    
    try {
      // Use the API to search products
      const searchResults = await clientProductService.searchProducts(query, 50)
      
      setState(prev => ({
        ...prev,
        results: searchResults,
        isSearching: false
      }))
    } catch (error) {
      console.error('Search error:', error)
      setState(prev => ({
        ...prev,
        results: [],
        isSearching: false
      }))
    }
  }, [])

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      isSearching: false
    }))
  }, [])

  const setFilter = useCallback((key: keyof SearchState['filters'], value: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }))
    
    // Re-run search with new filters if there's a query
    if (state.query) {
      search(state.query)
    }
  }, [state.query, search])

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: initialFilters
    }))
    
    // Re-run search if there's a query
    if (state.query) {
      search(state.query)
    }
  }, [state.query, search])

  return (
    <SearchContext.Provider
      value={{
        ...state,
        search,
        clearSearch,
        setFilter,
        clearFilters
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
