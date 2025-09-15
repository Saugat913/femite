import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { query } from './db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'client'
}

// Generate JWT token
export async function generateToken(user: AuthUser): Promise<string> {
  const token = await new SignJWT({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
  
  return token
}

// Verify JWT token
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Verify user still exists in database
    const result = await query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [payload.id as string]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    const user = result.rows[0]
    return {
      id: user.id,
      email: user.email,
      role: user.role
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Extract token from request headers
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Middleware to protect routes that require authentication
export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const token = extractToken(request)
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication token required' },
      { status: 401 }
    )
  }
  
  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
  
  return { user }
}

// Middleware to protect admin-only routes
export async function requireAdmin(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  if (authResult.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }
  
  return authResult
}

// Optional authentication - returns user if authenticated, but doesn't require it
export async function optionalAuth(request: NextRequest): Promise<{ user: AuthUser | null }> {
  const token = extractToken(request)
  
  if (!token) {
    return { user: null }
  }
  
  const user = await verifyToken(token)
  return { user }
}

// Utility to get user ID from authenticated request
export async function getUserId(request: NextRequest): Promise<string | null> {
  const token = extractToken(request)
  if (!token) return null
  
  const user = await verifyToken(token)
  return user?.id || null
}
