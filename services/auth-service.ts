// Authentication Service for Hemp Fashion E-commerce
// This service handles user authentication with backend API integration

import { apiService } from '@/lib/api-service'
import { API_CONFIG } from '@/lib/api-config'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface ProfileUpdateRequest {
  firstName?: string
  lastName?: string
  email?: string
}

export class AuthService {
  private readonly TOKEN_KEY = 'hemp-fashion-token'
  private readonly REFRESH_TOKEN_KEY = 'hemp-fashion-refresh-token'

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse | null> {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      )
      
      if (response.success && response.data) {
        // Backend handles session via cookies, but we also get a token
        const authData = {
          user: response.data.user,
          token: response.data.token
        }
        
        if (response.data.token) {
          this.setToken(response.data.token)
          apiService.setAuthToken(response.data.token)
        }
        
        return authData
      }
      
      throw new Error(response.message || 'Login failed')
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  }

  // Register new user
  async signup(userData: SignupRequest): Promise<AuthResponse | null> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      )
      
      if (response.success && response.data) {
        // Store tokens
        this.setToken(response.data.token)
        if (response.data.refreshToken) {
          this.setRefreshToken(response.data.refreshToken)
        }
        
        // Set auth token for future API calls
        apiService.setAuthToken(response.data.token)
        
        return response.data
      }
      
      throw new Error(response.message || 'Signup failed')
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  // Logout user
  async logout(): Promise<boolean> {
    try {
      // Call logout endpoint if available
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Error calling logout endpoint:', error)
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      this.clearTokens()
      // Clear API service auth token
      apiService.clearAuthToken()
    }
    
    return true
  }

  // Get current user profile
  async getProfile(): Promise<User | null> {
    try {
      const response = await apiService.get<User>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE
      )
      
      if (response.success && response.data) {
        return response.data
      }
      
      return null
    } catch (error) {
      console.error('Error getting profile:', error)
      return null
    }
  }

  // Update user profile
  async updateProfile(updates: ProfileUpdateRequest): Promise<User | null> {
    try {
      const response = await apiService.put<User>(
        API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE,
        updates
      )
      
      if (response.success && response.data) {
        return response.data
      }
      
      throw new Error(response.message || 'Profile update failed')
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Refresh authentication token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiService.post<{ token: string; refreshToken?: string }>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      )
      
      if (response.success && response.data) {
        this.setToken(response.data.token)
        if (response.data.refreshToken) {
          this.setRefreshToken(response.data.refreshToken)
        }
        
        apiService.setAuthToken(response.data.token)
        return response.data.token
      }
      
      throw new Error(response.message || 'Token refresh failed')
    } catch (error) {
      console.error('Error refreshing token:', error)
      // Clear tokens if refresh fails
      this.clearTokens()
      apiService.clearAuthToken()
      return null
    }
  }

  // Token management methods
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  private setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    }
    return null
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Initialize authentication (call on app startup)
  initialize(): void {
    const token = this.getToken()
    if (token) {
      apiService.setAuthToken(token)
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<boolean> {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      )
      
      return response.success || false
    } catch (error) {
      console.error('Error requesting password reset:', error)
      throw error
    }
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<boolean> {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password }
      )
      
      return response.success || false
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
