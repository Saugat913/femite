import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { decrypt, hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Verify reset token
    let payload
    try {
      payload = await decrypt(token)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 401 })
    }

    // Check if token is for password reset
    if (payload.type !== 'password_reset') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
    }

    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 401 })
    }

    // Check if user exists
    const userResult = await query('SELECT id FROM users WHERE id = $1', [payload.userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update user's password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, payload.userId]
    )

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
