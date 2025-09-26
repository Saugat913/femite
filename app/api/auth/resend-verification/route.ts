import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { isValidEmail, encrypt } from '@/lib/auth'
import { emailService } from '@/lib/email-service'

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

    // Find user by email
    const result = await query('SELECT id, email, email_verified FROM users WHERE email = $1', [email.toLowerCase()])

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        success: true,
        message: 'If an account with this email exists and is not verified, we have sent a verification email.' 
      })
    }

    const user = result.rows[0]

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json({ 
        error: 'Email already verified',
        message: 'This email address is already verified. You can log in directly.' 
      }, { status: 400 })
    }

    // Generate new verification token (valid for 24 hours)
    const verificationToken = await encrypt({
      userId: user.id,
      type: 'email_verification',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    })

    // Update user with new verification token
    await query(
      'UPDATE users SET email_verification_token = $1, email_verification_token_expires_at = $2 WHERE id = $3',
      [verificationToken, new Date(Date.now() + 24 * 60 * 60 * 1000), user.id]
    )

    // Send verification email
    try {
      const emailSent = await emailService.sendVerificationEmail(user.email, verificationToken)
      
      if (!emailSent) {
        console.error('Failed to send verification email to:', user.email)
        return NextResponse.json({ 
          error: 'Failed to send verification email',
          message: 'Unable to send verification email. Please try again later.' 
        }, { status: 500 })
      }

      console.log('Verification email resent successfully to:', user.email)
    } catch (error) {
      console.error('Error sending verification email:', error)
      return NextResponse.json({ 
        error: 'Failed to send verification email',
        message: 'Unable to send verification email. Please try again later.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox and spam folder.'
    })
  } catch (error) {
    console.error('POST /api/auth/resend-verification error:', error)
    return NextResponse.json({ error: 'Failed to resend verification email' }, { status: 500 })
  }
}