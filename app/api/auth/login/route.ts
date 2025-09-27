import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { comparePasswords, createSession, isValidEmail, encrypt } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Login API: Processing login for:', email)

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Find user by email
    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])

    if (result.rows.length === 0) {
      console.log('Login API: User not found for email:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = result.rows[0]
    console.log('Login API: Found user:', { id: user.id, email: user.email, verified: user.email_verified })

    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json({ 
        error: 'Email not verified', 
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before logging in. Check your inbox for a verification email.' 
      }, { status: 403 })
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password_hash)

    if (!isValidPassword) {
      console.log('Login API: Invalid password for user:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('Login API: Creating session for user:', user.id)
    // Create session
    const sessionData = await createSession(user.id, user.role)
    console.log('Login API: Session created:', sessionData)
    
    // Generate JWT token for API compatibility
    const token = await encrypt({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Return user info (without password) and token
    const { password_hash, ...userInfo } = user

    console.log('Login API: Sending successful response for user:', userInfo.email)
    const response = NextResponse.json({ 
      success: true,
      data: {
        user: userInfo,
        token
      },
      message: 'Login successful'
    })
    
    // Ensure cookies are set properly by adding additional headers
    response.headers.set('Set-Cookie', 
      response.headers.get('Set-Cookie') || ''
    )
    
    return response
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
