'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/lib/auth-context'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'password-reset-success') {
      setSuccessMessage('Your password has been reset successfully. Please sign in with your new password.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/account') // Redirect to account page after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-hemp-beige/30 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-hemp-green-light rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-hemp-green-dark" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-2">
              Welcome Back to Femite
            </h1>
            <p className="text-hemp-accent">
              Sign in to continue your revolutionary hemp fashion experience
            </p>
          </div>

          {/* Card */}
          <div className="card shadow-lg">
            <div className="card-padding sm:p-8">
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3 mb-6">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 mb-6">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="form-input pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-hemp-muted" />
                      ) : (
                        <Eye className="h-5 w-5 text-hemp-muted" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 text-hemp-green-dark focus:ring-hemp-green-dark border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-hemp-accent">
                      Remember me
                    </label>
                  </div>

                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-hemp-green-dark hover:text-hemp-green-medium transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" text="" className="py-1" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-hemp-accent">
                  New to sustainable fashion?{' '}
                  <Link 
                    href="/register" 
                    className="text-hemp-green-dark hover:text-hemp-green-medium font-medium transition-colors"
                  >
                    Create your account
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-xs text-hemp-muted">
              Need help? Contact our{' '}
              <Link
                href="/contact"
                className="text-hemp-green-dark hover:text-hemp-green-medium transition-colors underline"
              >
                customer support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
