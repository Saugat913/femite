// API Service utilities for Hemp Fashion E-commerce
// This provides a centralized HTTP client with error handling, retries, and type safety

import { API_CONFIG, ApiResponse, buildApiUrl } from './api-config'

// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// Request options
interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string | number>
  timeout?: number
  retries?: number
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Sleep utility for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Main API service class
class ApiService {
  private baseHeaders: Record<string, string>

  constructor() {
    this.baseHeaders = { ...API_CONFIG.HEADERS }
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.baseHeaders['Authorization'] = `Bearer ${token}`
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.baseHeaders['Authorization']
  }

  // Make HTTP request with retry logic
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.RETRY.attempts
    } = options

    const url = buildApiUrl(endpoint, params)
    const requestHeaders = { ...this.baseHeaders, ...headers }

    // Prepare request configuration
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    // Retry logic
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestConfig)
        
        // Parse response
        let data: any
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text()
        }

        // Handle HTTP errors
        if (!response.ok) {
          const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
          throw new ApiError(errorMessage, response.status, data)
        }

        // Return successful response - handle both direct data and wrapped responses
        if (data && typeof data === 'object' && ('data' in data || 'success' in data)) {
          return data as ApiResponse<T>
        } else {
          // For Next.js API routes that return data directly
          return { success: true, data } as ApiResponse<T>
        }

      } catch (error) {
        // Don't retry on client errors (4xx) or the last attempt
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error
        }

        if (attempt === retries) {
          if (error instanceof ApiError) {
            throw error
          }
          throw new ApiError(
            error instanceof Error ? error.message : 'Network error occurred',
            0,
            error
          )
        }

        // Wait before retrying
        await sleep(API_CONFIG.RETRY.delay * attempt)
      }
    }

    throw new ApiError('Max retries exceeded', 0)
  }

  // Convenience methods for different HTTP verbs
  async get<T = any>(endpoint: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, ...options })
  }

  async put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, ...options })
  }

  async patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body, ...options })
  }

  async delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options })
  }
}

// Create and export a singleton instance
export const apiService = new ApiService()

// Export types and utilities
export { type ApiResponse }

// Higher-order function to handle API errors in components
export const withApiErrorHandler = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('API Error:', {
          message: error.message,
          status: error.status,
          response: error.response
        })
        
        // You can add toast notifications here
        // toast.error(error.message)
      } else {
        console.error('Unexpected error:', error)
        // toast.error('An unexpected error occurred')
      }
      return null
    }
  }
}

// React hook for API loading states (client-side only)
export const useApiState = () => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      loading: false,
      error: null,
      execute: async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
        try {
          return await apiCall()
        } catch (error) {
          console.error('API Error:', error)
          return null
        }
      }
    }
  }
  
  // Client-side implementation with React hooks
  const { useState } = require('react')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      return result
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, execute }
}
