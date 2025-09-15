// API Configuration for Hemp Fashion E-commerce
// This file centralizes all API endpoints and configurations for easy plug-and-play integration

export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URL: {
    development: 'http://localhost:3000/api',
    production: process.env.NEXT_PUBLIC_API_URL || '/api',
    staging: process.env.NEXT_PUBLIC_STAGING_API_URL || '/api'
  },

  // API Endpoints
  ENDPOINTS: {
    // Products
    PRODUCTS: {
      LIST: '/products',
      DETAIL: '/products/:id',
      SEARCH: '/products',
      CATEGORIES: '/products/categories',
      FEATURED: '/products',
      BY_CATEGORY: '/products',
      BY_COLLECTION: '/products'
    },

    // User Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
      UPDATE_PROFILE: '/auth/profile',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password'
    },

    // Cart & Orders
    CART: {
      GET: '/cart',
      ADD: '/cart/add',
      UPDATE: '/cart/update',
      REMOVE: '/cart/remove',
      CLEAR: '/cart/clear'
    },

    ORDERS: {
      CREATE: '/orders',
      LIST: '/orders',
      DETAIL: '/orders/:id',
      UPDATE_STATUS: '/orders/:id/status',
      TRACK: '/orders/:id/track'
    },

    // User Account
    ACCOUNT: {
      ADDRESSES: '/account/addresses',
      ADD_ADDRESS: '/account/addresses',
      UPDATE_ADDRESS: '/account/addresses/:id',
      DELETE_ADDRESS: '/account/addresses/:id',
      PAYMENT_METHODS: '/account/payment-methods',
      ADD_PAYMENT_METHOD: '/account/payment-methods',
      DELETE_PAYMENT_METHOD: '/account/payment-methods/:id'
    },

    // Blog & Content
    BLOG: {
      POSTS: '/blog/posts',
      POST_DETAIL: '/blog/posts/:slug',
      CATEGORIES: '/blog/categories',
      FEATURED_POSTS: '/blog/featured'
    },

    // Newsletter
    NEWSLETTER: {
      SUBSCRIBE: '/newsletter/subscribe',
      UNSUBSCRIBE: '/newsletter/unsubscribe'
    },

    // Contact
    CONTACT: {
      SUBMIT: '/contact/submit'
    },

    // Checkout
    CHECKOUT: {
      INIT: '/checkout/init',
      PAYMENT: '/checkout/payment',
      CONFIRM: '/checkout/confirm'
    }
  },

  // Request Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // Timeout settings
  TIMEOUT: 10000, // 10 seconds

  // Retry settings
  RETRY: {
    attempts: 3,
    delay: 1000 // 1 second
  }
}

// Get current API base URL based on environment
export const getApiBaseUrl = (): string => {
  const env = process.env.NODE_ENV as keyof typeof API_CONFIG.BASE_URL
  return API_CONFIG.BASE_URL[env] || API_CONFIG.BASE_URL.development
}

// Build full API URL
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = getApiBaseUrl() + endpoint
  
  // Replace URL parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value))
    })
  }
  
  return url
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface SearchParams extends PaginationParams {
  q?: string
  category?: string
  collection?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  colors?: string[]
}
