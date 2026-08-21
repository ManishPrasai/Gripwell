import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { accessFromToken, can, type PermArea } from './lib/rbac'

/* ─────────────────────────────────────────────────────────────────────────
   ROUTE CLASSIFICATION
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Always public — no token required.
 *
 * `/media/` serves product photos out of KV. They're public catalog imagery
 * (the storefront serves the identical bytes to anonymous shoppers), and
 * leaving them gated would bounce every <img> in the console to /login the
 * moment an access token lapsed.
 */
const PUBLIC_PREFIXES = ['/login', '/api/auth/', '/media/']

/**
 * /api/admin/* routes only accessible to SUPER_ADMIN.
 * STORE_MANAGER gets a hard 404 on these — not a 403, not a redirect.
 * (A 403 reveals the route exists; a 404 doesn't.)
 */
/**
 * Fine-grained gate: API route prefix → the permission area it requires (manage).
 * A role without that permission gets a hard 404. Legacy tokens (no embedded
 * perms) fall back to role-derived defaults, preserving the old behaviour.
 */
const API_AREA: [string, PermArea][] = [
  ['/api/admin/roles',     'roles'],
  ['/api/admin/users',     'staff'],
  ['/api/admin/staff',     'staff'],
  ['/api/admin/discounts', 'finance'],
  ['/api/admin/import',    'inventory'],
  ['/api/admin/seo',       'website'],
  ['/api/admin/website',   'website'],
  ['/api/admin/analytics', 'finance'],
]

/**
 * Page paths only accessible to SUPER_ADMIN.
 * Currently the dashboard is a SPA at /  so most access control happens
 * at the API level, but define page routes here for future sub-pages.
 */
const SUPER_ADMIN_ONLY_PAGES: string[] = [
  // e.g. '/roles', '/import' — add when dedicated pages are created
]

/* ─────────────────────────────────────────────────────────────────────────
   JWT HELPERS  (Edge-compatible — jose only, no ioredis)
   ───────────────────────────────────────────────────────────────────────── */

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

type AdminPayload = {
  id:      string
  email:   string
  type:    string
  role:    string
  storeId: string | undefined
}

async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== 'admin') return null
    return payload as unknown as AdminPayload
  } catch {
    return null
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   RESPONSE HELPERS
   ───────────────────────────────────────────────────────────────────────── */

/** Hard 404 for page routes — reveals nothing about what's here */
function page404() {
  return new NextResponse(null, { status: 404 })
}

/** Hard 404 for API routes */
function api404() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/* ─────────────────────────────────────────────────────────────────────────
   MIDDLEWARE
   ───────────────────────────────────────────────────────────────────────── */

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  /* 1 ── Always public ─────────────────────────────────────────────────── */
  if (
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  /* 2 ── Determine context ────────────────────────────────────────────── */
  const isAdminApi   = pathname.startsWith('/api/admin/')
  const isOtherApi   = pathname.startsWith('/api/') && !isAdminApi
  const isPageRoute  = !pathname.startsWith('/api/')

  /* 3 ── Non-admin API routes pass through (no admin token required) ───── */
  if (isOtherApi) {
    return NextResponse.next()
  }

  /* 4 ── Verify admin token from cookie ──────────────────────────────── */
  const accessToken  = req.cookies.get('admin_access_token')?.value
  const refreshToken = req.cookies.get('admin_refresh_token')?.value
  const payload      = accessToken ? await verifyAdminToken(accessToken) : null

  /* 5 ── /api/admin/* — requires valid admin token + area permission ──── */
  if (isAdminApi) {
    if (!payload) return api404()

    const gated = API_AREA.find(([p]) => pathname.startsWith(p))
    if (gated && !can(accessFromToken(payload as any), gated[1], 2)) return api404()

    return NextResponse.next()
  }

  /* 6 ── Page routes ──────────────────────────────────────────────────── */
  if (isPageRoute) {
    if (!payload) {
      /* No valid access token — try silent refresh via refresh cookie */
      if (refreshToken) {
        const url = new URL('/api/auth/refresh-redirect', req.url)
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
      }
      /* No session at all → login */
      const url = new URL('/login', req.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    /* Authenticated but wrong role for this page → hard 404 */
    const isSuperAdminPage = SUPER_ADMIN_ONLY_PAGES.some(r => pathname.startsWith(r))
    if (isSuperAdminPage && payload.role !== 'SUPER_ADMIN') return page404()

    /* Forward role + admin ID to downstream handlers via header */
    const res = NextResponse.next()
    res.headers.set('x-admin-id',   payload.id)
    res.headers.set('x-admin-role', payload.role)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
