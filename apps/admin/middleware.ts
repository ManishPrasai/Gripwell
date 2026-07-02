import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

/* Paths that never require authentication */
const PUBLIC_PATHS = ['/login', '/api/auth/']

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  /* Always allow public paths, API routes (they handle their own auth),
     and Next.js internals */
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const accessToken  = req.cookies.get('admin_access_token')?.value
  const refreshToken = req.cookies.get('admin_refresh_token')?.value

  /* Access token present and valid → proceed */
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken)
    if (payload && payload.type === 'admin') {
      return NextResponse.next()
    }
  }

  /* Access token missing or expired — if a refresh token exists, redirect
     through the refresh-redirect route which will issue a new access token
     cookie and return the user to their original destination. */
  if (refreshToken) {
    const refreshUrl = new URL('/api/auth/refresh-redirect', req.url)
    refreshUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(refreshUrl)
  }

  /* No valid session at all → login */
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
