'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Key, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setError('Invalid or missing reset token. Please request a new password reset.')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!token) {
      setError('Invalid reset token.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=password-reset-success')
        }, 3000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = (password: string) => {
    if (password.length === 0) return 'bg-gray-200'
    if (password.length < 8) return 'bg-red-300'
    if (password.length < 12) return 'bg-yellow-300'
    return 'bg-green-300'
  }

  const getPasswordStrengthText = (password: string) => {
    if (password.length === 0) return ''
    if (password.length < 8) return 'Weak - At least 8 characters required'
    if (password.length < 12) return 'Good - Consider adding more characters'
    return 'Strong password'
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-hemp-beige/30 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Back to Login */}
          <div className="mb-8">
            <Link
              href="/login"
              className="flex items-center text-hemp-accent hover:text-hemp-green-dark transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Card */}
          <div className="card shadow-lg">
            <div className="card-padding sm:p-8">
              {!isSuccess ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-hemp-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key className="w-8 h-8 text-hemp-green-dark" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-2">
                      Set New Password
                    </h1>
                    <p className="text-hemp-accent">
                      Create a strong password to secure your account.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}

                    {/* New Password */}
                    <div>
                      <label htmlFor="password" className="form-label">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          className="form-input pr-12"
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                      
                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(password)}`}
                                style={{ width: `${Math.min((password.length / 12) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-hemp-muted mt-1">
                            {getPasswordStrengthText(password)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          className="form-input pr-12"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-hemp-muted" />
                          ) : (
                            <Eye className="h-5 w-5 text-hemp-muted" />
                          )}
                        </button>
                      </div>
                      
                      {/* Password Match Indicator */}
                      {confirmPassword && (
                        <p className={`text-xs mt-1 ${
                          password === confirmPassword ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !token}
                      className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" text="Updating Password..." className="py-1" />
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </form>

                  {/* Security Tips */}
                  <div className="mt-8 p-4 bg-hemp-beige/50 rounded-lg">
                    <h3 className="text-sm font-semibold text-hemp-text mb-2">Password Security Tips:</h3>
                    <ul className="text-xs text-hemp-accent space-y-1">
                      <li>• Use at least 8 characters</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Add numbers and special characters</li>
                      <li>• Avoid common words or personal information</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-2">
                      Password Reset Complete
                    </h1>
                    <p className="text-hemp-accent mb-8">
                      Your password has been successfully updated. You can now sign in with your new password.
                    </p>
                    
                    <div className="space-y-4">
                      <Link
                        href="/login"
                        className="btn-primary w-full py-3"
                      >
                        Continue to Login
                      </Link>
                      
                      <p className="text-xs text-hemp-muted">
                        Redirecting automatically in 3 seconds...
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-xs text-hemp-muted">
              Having trouble? Contact our{' '}
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
