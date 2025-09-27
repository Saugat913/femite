import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

// Protected API routes that require authentication
const protectedApiRoutes = [
  '/api/checkout',
  '/api/orders',
  '/api/auth/profile',
  '/api/auth/logout'
]

// Protected pages that require authentication
const protectedPages = [
  '/account',
  '/checkout',
  '/orders'
]

async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })

    // Check if session has custom expires field and validate it
    if (payload.expires) {
      const expiresDate = new Date(payload.expires as string)
      if (expiresDate <= new Date()) {
        return null // Session expired
      }
    }

    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route requires protection
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )
  const isProtectedPage = protectedPages.some(page => 
    pathname.startsWith(page)
  )

  if (isProtectedApiRoute || isProtectedPage) {
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { 
            error: 'Authentication required',
            code: 'SESSION_MISSING' 
          }, 
          { status: 401 }
        )
      } else {
        // Redirect to login for protected pages
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }

    // Verify the session
    const session = await verifySession(sessionCookie.value)
    
    if (!session) {
      // Clear invalid session cookie
      const response = isProtectedApiRoute 
        ? NextResponse.json(
            { 
              error: 'Invalid or expired session',
              code: 'SESSION_INVALID' 
            }, 
            { status: 401 }
          )
        : NextResponse.redirect(new URL('/login', request.url))
      
      // Clear the invalid session cookie
      response.cookies.set('session', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      
      return response
    }

    // Add user info to request headers for API routes
    if (isProtectedApiRoute) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', session.userId as string)
      requestHeaders.set('x-user-role', session.role as string)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected pages
    '/account/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    // Protected API routes
    '/api/checkout/:path*',
    '/api/orders/:path*',
    '/api/auth/profile',
    '/api/auth/logout',
    // Cart APIs (some may need auth)
    '/api/cart/:path*',
    '/api/addresses/:path*'
  ],
}
