'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // In development, show the reset URL
        if (data.resetUrl) {
          console.log('Password reset link:', data.resetUrl)
        }
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
                      <Mail className="w-8 h-8 text-hemp-green-dark" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-2">
                      Reset Your Password
                    </h1>
                    <p className="text-hemp-accent">
                      Enter your email address and we'll send you a secure link to reset your password.
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

                    <div>
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="form-input"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" text="Sending Reset Link..." className="py-1" />
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </form>

                  {/* Footer */}
                  <div className="mt-8 text-center">
                    <p className="text-sm text-hemp-accent">
                      Remember your password?{' '}
                      <Link
                        href="/login"
                        className="font-medium text-hemp-green-dark hover:text-hemp-green-medium transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
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
                      Check Your Email
                    </h1>
                    <p className="text-hemp-accent mb-8">
                      We've sent a password reset link to{' '}
                      <span className="font-medium text-hemp-text">{email}</span>
                    </p>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-hemp-accent">
                        Didn't receive the email? Check your spam folder or{' '}
                        <button
                          onClick={() => {
                            setIsSuccess(false)
                            setEmail('')
                          }}
                          className="font-medium text-hemp-green-dark hover:text-hemp-green-medium transition-colors underline"
                        >
                          try again
                        </button>
                      </p>
                      
                      <Link
                        href="/login"
                        className="btn-secondary w-full py-3"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </div>
                </>
              )}
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
