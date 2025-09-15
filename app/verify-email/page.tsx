'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email for the correct link.')
      return
    }

    // Verify email with token
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?message=email-verified')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Email verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  const handleResendVerification = async () => {
    if (!email) return

    setIsResending(true)
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage('Verification email sent successfully. Please check your inbox.')
        if (data.verificationUrl) {
          console.log('Verification link:', data.verificationUrl)
        }
      } else {
        setMessage(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-hemp-beige/30 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Card */}
          <div className="card shadow-lg">
            <div className="card-padding sm:p-8 text-center">
              {status === 'loading' && (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-4">
                    Verifying Email
                  </h1>
                  <LoadingSpinner size="lg" text="Please wait while we verify your email address..." />
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-2">
                    Email Verified!
                  </h1>
                  <p className="text-hemp-accent mb-8">
                    {message}
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
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-2">
                    Verification Failed
                  </h1>
                  <p className="text-hemp-accent mb-8">
                    {message}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        type="email"
                        placeholder="Enter your email to resend verification"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input mb-3"
                      />
                      <button
                        onClick={handleResendVerification}
                        disabled={!email || isResending}
                        className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResending ? (
                          <LoadingSpinner size="sm" text="Sending..." className="py-1" />
                        ) : (
                          'Resend Verification Email'
                        )}
                      </button>
                    </div>
                    
                    <Link
                      href="/login"
                      className="btn-secondary w-full py-3"
                    >
                      Back to Login
                    </Link>
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
