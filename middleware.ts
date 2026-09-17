import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.MASTER_SESSION_SECRET || 'your-secret-key-change-in-production'
)

// Protected master routes that require authentication
const protectedRoutes = ['/master', '/master/', '/master/results']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected master route
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Skip middleware for /login
    if (pathname === '/login') {
      return NextResponse.next()
    }

    try {
      const token = request.cookies.get('master_token')?.value

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Verify the JWT token
      await jwtVerify(token, secret)

      return NextResponse.next()
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
