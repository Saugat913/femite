import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const result = await query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [session.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = result.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    })
  } catch (error) {
    console.error('GET /api/auth/profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const emailCheck = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email.toLowerCase(), session.userId]
    )

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 409 }
      )
    }

    // Update user profile
    const result = await query(
      'UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email, role, created_at',
      [email.toLowerCase(), session.userId]
    )

    const user = result.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    })
  } catch (error) {
    console.error('PUT /api/auth/profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
