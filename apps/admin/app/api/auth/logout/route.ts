import { NextRequest, NextResponse } from 'next/server'
import { prisma, hashRefreshToken, verifyAccessToken } from '@nova/database'
import { logAction } from '../../../../lib/audit'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('admin_refresh_token')?.value
    const accessToken  = req.cookies.get('admin_access_token')?.value
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'

    /* Resolve admin ID from access token for audit log (best-effort) */
    const payload = accessToken ? verifyAccessToken(accessToken) : null

    if (refreshToken) {
      const refreshTokenHash = hashRefreshToken(refreshToken)
      await prisma.adminSession.updateMany({
        where: { refreshTokenHash },
        data:  { isActive: false, revokedAt: new Date() },
      })
    }

    /* ── Audit log ── */
    if (payload?.id) {
      await logAction({ adminId: payload.id, action: 'LOGOUT', entityType: 'AdminUser', entityId: payload.id, ip })
    }

    const clearOpts = {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge:   0,
      path:     '/',
    }
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_access_token',  '', clearOpts)
    response.cookies.set('admin_refresh_token', '', clearOpts)
    return response

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
