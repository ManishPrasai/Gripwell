import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

/* Edge-safe JWT verification.
   NOTE: the previous version imported verifyAccessToken from '@nova/database',
   which transitively pulls in ioredis — incompatible with the Edge runtime and
   crashed the middleware on every request. `jose` verifies the same HS256 token
   (signed with NEXTAUTH_SECRET) without any Node-only dependencies. */

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

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

async function verify(token?: string): Promise<Record<string, unknown> | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  const payload = await verify(token)
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
