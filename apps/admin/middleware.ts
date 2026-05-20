import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@nova/database'

const protectedRoutes = [
  '/dashboard',
  '/orders',
  '/appointments',
  '/enquiries',
  '/customers',
  '/inventory',
  '/stores',
  '/analytics',
  '/settings'
]

const superAdminOnlyRoutes = [
  '/products',
  '/discounts',
  '/admin-accounts',
  '/seo'
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  const payload = token ? verifyAccessToken(token) : null
  const isAuthenticated = !!payload && payload.type === 'admin'
  const isSuperAdmin = payload?.role === 'SUPER_ADMIN'

  // Redirect unauthenticated users to login
  if (
    protectedRoutes.some(route => pathname.startsWith(route)) ||
    superAdminOnlyRoutes.some(route => pathname.startsWith(route))
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Block Store Managers from Super Admin only routes
  if (superAdminOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Redirect authenticated admins away from login
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}