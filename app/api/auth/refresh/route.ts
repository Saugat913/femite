import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { encrypt, decrypt, refreshSessionIfNeeded, validateSession, isSessionNearExpiration } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Try automatic session refresh first
    const validation = await validateSession()
    
    if (validation.success) {
      // Session is valid, try to refresh if needed
      const refreshed = await refreshSessionIfNeeded()
      const nearExpiration = await isSessionNearExpiration()
      
      return NextResponse.json({
        success: true,
        data: {
          refreshed,
          nearExpiration,
          session: {
            userId: validation.session?.userId,
            role: validation.session?.role,
            expires: validation.session?.expires
          }
        },
        message: refreshed ? 'Session refreshed successfully' : 'Session is still valid'
      })
    }

    // Fallback to legacy refresh token method
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({
        error: validation.error?.message || 'Authentication required',
        code: validation.error?.code || 'SESSION_INVALID',
        requiresReauth: validation.error?.requiresReauth || true
      }, { status: 401 })
    }

    // Verify refresh token
    let payload
    try {
      payload = await decrypt(refreshToken)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    // Check if user still exists
    const result = await query('SELECT id, email, role FROM users WHERE id = $1', [payload.userId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result.rows[0]

    // Generate new access token
    const newToken = await encrypt({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Generate new refresh token (optional - could keep the same one)
    const newRefreshToken = await encrypt({
      userId: user.id,
      type: 'refresh'
    })

    return NextResponse.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    console.error('POST /api/auth/refresh error:', error)
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 })
  }
}

// GET endpoint for checking session status
export async function GET(request: NextRequest) {
  try {
    const validation = await validateSession()
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: validation.error?.message || 'Invalid session',
          code: validation.error?.code || 'SESSION_INVALID',
          requiresReauth: validation.error?.requiresReauth || true
        }, 
        { status: 401 }
      )
    }

    const nearExpiration = await isSessionNearExpiration()
    
    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        nearExpiration,
        session: {
          userId: validation.session?.userId,
          role: validation.session?.role,
          expires: validation.session?.expires
        }
      }
    })
  } catch (error) {
    console.error('GET /api/auth/refresh error:', error)
    return NextResponse.json(
      { error: 'Session validation failed' }, 
      { status: 500 }
    )
  }
}
