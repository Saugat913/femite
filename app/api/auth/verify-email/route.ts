import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { emailService } from '@/lib/email-service'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    // Find user with this verification token
    const userResult = await query(
      'SELECT id, email, email_verification_token_expires_at FROM users WHERE email_verification_token = $1',
      [token]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }

    const user = userResult.rows[0]
    
    // Check if token has expired
    if (user.email_verification_token_expires_at && new Date() > new Date(user.email_verification_token_expires_at)) {
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 })
    }

    // Update user as verified
    await query(
      `UPDATE users 
       SET email_verified = TRUE, 
           email_verification_token = NULL, 
           email_verification_token_expires_at = NULL 
       WHERE id = $1`,
      [user.id]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully. You can now sign in.' 
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      // Don't reveal that email doesn't exist
      return NextResponse.json({ 
        message: 'If an account with that email exists, we\'ve sent a verification link.' 
      })
    }

    const user = userResult.rows[0]
    
    if (user.email_verified) {
      return NextResponse.json({ 
        message: 'Email is already verified.' 
      })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with verification token
    await query(
      `UPDATE users 
       SET email_verification_token = $1, 
           email_verification_token_expires_at = $2 
       WHERE id = $3`,
      [verificationToken, tokenExpiry, user.id]
    )

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken)
      console.log(`Verification email sent to ${email}`)
      
      return NextResponse.json({ 
        message: 'Verification email sent successfully.',
        // In development, include the verification link for testing
        ...(process.env.NODE_ENV === 'development' && { 
          verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}` 
        })
      })
    } catch (error) {
      console.error('Failed to send verification email:', error)
      return NextResponse.json({ 
        message: 'Verification email sent successfully.', // Don't reveal email sending failures for security
        // In development, still provide the link even if email fails
        ...(process.env.NODE_ENV === 'development' && { 
          verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`,
          note: 'Email sending failed, but here\'s the verification link for development.'
        })
      })
    }

  } catch (error) {
    console.error('Send verification email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
