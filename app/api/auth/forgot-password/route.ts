import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { isValidEmail, encrypt } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user exists
    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])

    // Always return success to prevent email enumeration attacks
    // but only send email if user exists
    let resetToken: string | null = null
    if (result.rows.length > 0) {
      const user = result.rows[0]
      
      // Generate password reset token (valid for 1 hour)
      resetToken = await encrypt({
        userId: user.id,
        type: 'password_reset',
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      })

      // Send password reset email
      try {
        const { emailService } = await import('@/lib/email-service')
        const emailSent = await emailService.sendPasswordResetEmail(email, resetToken)
        
        if (!emailSent) {
          console.error('Failed to send password reset email to:', email)
          // Still return success to prevent email enumeration attacks
        } else {
          console.log('Password reset email sent successfully to:', email)
        }
      } catch (error) {
        console.error('Error sending password reset email:', error)
        // Still return success to prevent email enumeration attacks
      }
    }

    const response = {
      success: true,
      message: 'If an account with this email exists, we have sent a password reset link.'
    }

    // In development, also return the reset URL for testing
    if (process.env.NODE_ENV === 'development' && resetToken) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
      // @ts-ignore
      response.resetUrl = resetUrl
      console.log('Development reset URL:', resetUrl)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
