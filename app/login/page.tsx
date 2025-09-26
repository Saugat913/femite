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
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    const emailParam = searchParams.get('email')
    
    if (message === 'password-reset-success') {
      setSuccessMessage('Your password has been reset successfully. Please sign in with your new password.')
    } else if (message === 'registration-success') {
      setSuccessMessage('Registration successful! Please verify your email address before logging in. Check your inbox for a verification email.')
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam))
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailNotVerified(false)
    setLoading(true)

    try {
      await login(email, password)
      router.push('/account') // Redirect to account page after successful login
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      
      // Check if it's an email verification error
      if (errorMessage.includes('Email not verified') || errorMessage.includes('verify your email')) {
        setEmailNotVerified(true)
        setError('Please verify your email address before logging in. Check your inbox for a verification email.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }

    setResendingVerification(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Verification email sent! Please check your inbox and spam folder.')
        setEmailNotVerified(false)
        setError('')
      } else {
        setError(data.message || data.error || 'Failed to send verification email')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setResendingVerification(false)
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
                <div className={`p-4 border rounded-lg flex items-start space-x-3 mb-6 ${
                  emailNotVerified ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    emailNotVerified ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${
                      emailNotVerified ? 'text-yellow-700' : 'text-red-700'
                    }`}>{error}</p>
                    {emailNotVerified && (
                      <div className="mt-3">
                        <button
                          onClick={handleResendVerification}
                          disabled={resendingVerification}
                          className="text-sm font-medium text-hemp-green-dark hover:text-hemp-green-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resendingVerification ? 'Sending...' : 'Resend verification email'}
                        </button>
                      </div>
                    )}
                  </div>
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
