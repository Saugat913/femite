import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })

    if (payload.expires) {
      const expiresDate = new Date(payload.expires as string)
      if (expiresDate <= new Date()) {
        return null
      }
    }

    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define protected routes inline to avoid complex patterns
  const isProtected = 
    pathname === '/account' ||
    pathname === '/checkout' ||
    pathname === '/orders' ||
    pathname.startsWith('/api/checkout/') ||
    pathname === '/api/orders' ||
    pathname === '/api/auth/profile' ||
    pathname === '/api/auth/logout'

  if (!isProtected) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('session')
  
  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    } else {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const session = await verifySession(sessionCookie.value)
  
  if (!session) {
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))
    
    response.cookies.set('session', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
    
    return response
  }

  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', session.userId as string)
    requestHeaders.set('x-user-role', session.role as string)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
