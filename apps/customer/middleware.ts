import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@nova/database'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/orders',
  '/appointments',
  '/profile'
]

// Routes only for non-authenticated users
const authRoutes = [
  '/login',
  '/register'
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  const isAuthenticated = token ? !!verifyAccessToken(token) : false

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Redirect unauthenticated users away from protected pages
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}