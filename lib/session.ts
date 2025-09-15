import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import crypto from 'crypto'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',      // 15 minutes
  REFRESH_TOKEN: '7d',      // 7 days
  REMEMBER_ME_TOKEN: '30d'  // 30 days
}

export interface SessionPayload {
  userId: string
  email: string
  role: string
  sessionId?: string
  iat?: number
  exp?: number
}

export interface RefreshTokenData {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  userAgent?: string
  ipAddress?: string
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token for storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Create an access token (JWT)
 */
export async function createAccessToken(payload: SessionPayload, expiresIn: string = TOKEN_EXPIRY.ACCESS_TOKEN): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  } catch (error) {
    console.error('Access token verification failed:', error)
    return null
  }
}

/**
 * Create and store a refresh token
 */
export async function createRefreshToken(
  userId: string,
  userAgent?: string,
  ipAddress?: string,
  rememberMe: boolean = false
): Promise<string> {
  const client = await getClient()
  
  try {
    await client.query('BEGIN')
    
    // Generate secure token
    const token = generateSecureToken()
    const tokenHash = hashToken(token)
    
    // Set expiration based on remember me preference
    const expiresAt = new Date()
    expiresAt.setTime(
      expiresAt.getTime() + 
      (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000) // 30 days or 7 days
    )
    
    // Store refresh token in database
    await client.query(`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, tokenHash, expiresAt, userAgent, ipAddress])
    
    await client.query('COMMIT')
    return token
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating refresh token:', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Verify and get refresh token data
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenData | null> {
  try {
    const tokenHash = hashToken(token)
    
    const result = await query(`
      SELECT rt.id, rt.user_id, rt.token_hash, rt.expires_at, rt.user_agent, rt.ip_address,
             u.email, u.role
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token_hash = $1 
        AND rt.expires_at > NOW() 
        AND rt.is_revoked = FALSE
    `, [tokenHash])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    
    // Update last_used_at
    await query(`
      UPDATE refresh_tokens 
      SET last_used_at = NOW() 
      WHERE id = $1
    `, [row.id])
    
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      userAgent: row.user_agent,
      ipAddress: row.ip_address
    }
  } catch (error) {
    console.error('Error verifying refresh token:', error)
    return null
  }
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(tokenId: string): Promise<boolean> {
  try {
    const result = await query(`
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE id = $1
    `, [tokenId])
    
    return result.rowCount > 0
  } catch (error) {
    console.error('Error revoking refresh token:', error)
    return false
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<boolean> {
  try {
    await query(`
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE user_id = $1
    `, [userId])
    
    return true
  } catch (error) {
    console.error('Error revoking all user tokens:', error)
    return false
  }
}

/**
 * Clean up expired refresh tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await query(`
      DELETE FROM refresh_tokens 
      WHERE expires_at < NOW() OR is_revoked = TRUE
    `)
    
    return result.rowCount || 0
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error)
    return 0
  }
}

/**
 * Set secure cookies for authentication
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false
) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Set access token cookie (httpOnly, short expiration)
  response.cookies.set('session', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  })
  
  // Set refresh token cookie (httpOnly, longer expiration)
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
    path: '/'
  })
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('session')
  response.cookies.delete('refreshToken')
}

/**
 * Get session from cookies
 */
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('session')
  
  if (!sessionCookie) {
    return null
  }
  
  return await verifyAccessToken(sessionCookie.value)
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for client IP
  const xRealIP = request.headers.get('x-real-ip')
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xClientIP = request.headers.get('x-client-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (xClientIP) return xClientIP
  if (xRealIP) return xRealIP
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim()
  
  return request.ip || '127.0.0.1'
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown'
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  newRefreshToken?: string
  user: SessionPayload
} | null> {
  try {
    // Verify the refresh token
    const refreshData = await verifyRefreshToken(refreshToken)
    if (!refreshData) {
      return null
    }
    
    // Get user data
    const userResult = await query(`
      SELECT id, email, role, created_at 
      FROM users 
      WHERE id = $1
    `, [refreshData.userId])
    
    if (userResult.rows.length === 0) {
      return null
    }
    
    const user = userResult.rows[0]
    
    // Create new access token
    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }
    
    const accessToken = await createAccessToken(sessionPayload)
    
    // Optionally create new refresh token if the current one is close to expiry
    const tokenAge = Date.now() - new Date(refreshData.expiresAt).getTime()
    const shouldRotateToken = tokenAge > (24 * 60 * 60 * 1000) // Rotate if older than 1 day
    
    let newRefreshToken: string | undefined
    if (shouldRotateToken) {
      // Revoke old token
      await revokeRefreshToken(refreshData.id)
      // Create new refresh token
      newRefreshToken = await createRefreshToken(
        user.id,
        refreshData.userAgent,
        refreshData.ipAddress
      )
    }
    
    return {
      accessToken,
      newRefreshToken,
      user: sessionPayload
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return null
  }
}
