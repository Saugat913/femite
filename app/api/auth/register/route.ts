import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, createSession, isValidEmail, encrypt } from '@/lib/auth'
import { emailService } from '@/lib/email-service'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role = 'client' } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (!['admin', 'client'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with email verification fields
    const id = uuidv4()
    const result = await query(
      `INSERT INTO users (id, email, password_hash, role, email_verification_token, email_verification_token_expires_at, email_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, email, role, created_at`,
      [id, email.toLowerCase(), passwordHash, role, verificationToken, tokenExpiry, false]
    )

    const user = result.rows[0]
    
    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken)
      console.log(`Verification email sent to ${user.email}`)
    } catch (error) {
      console.error('Failed to send verification email:', error)
      // Continue with registration even if email fails
    }

    // Create session (but user will need to verify email)
    await createSession(user.id, user.role)
    
    // Generate JWT token for API compatibility
    const token = await encrypt({
      id: user.id,
      email: user.email,
      role: user.role
    })

    return NextResponse.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Registration successful! Please check your email to verify your account.',
      requiresEmailVerification: true
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
