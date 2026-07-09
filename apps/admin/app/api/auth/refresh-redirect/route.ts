import { NextRequest, NextResponse } from 'next/server'
import {
  prisma,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '@nova/database'
import { IDLE_LOGOUT_ENABLED } from '../../../../lib/config'

/**
 * Called by middleware when the access token has expired but a refresh token
 * cookie is present. Issues new access + refresh token cookies and redirects
 * the user back to their original destination.
 * If the refresh token is invalid or revoked, redirects to /login.
 */
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') || '/'
  const refreshToken = req.cookies.get('admin_refresh_token')?.value

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  }

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('from', next)

  if (!refreshToken) {
    return NextResponse.redirect(loginUrl)
  }

  try {
    const refreshTokenHash = hashRefreshToken(refreshToken)

    const session = await prisma.adminSession.findFirst({
      where: {
        refreshTokenHash,
        isActive: true,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            role: true,
            storeId: true,
            isActive: true,
          },
        },
      },
    })

    if (!session || !session.admin.isActive) {
      return NextResponse.redirect(loginUrl)
    }

    /* Inactivity check — same 30-min rule as the /refresh endpoint */
    const IDLE_TIMEOUT_MS = 30 * 60 * 1000
    if (IDLE_LOGOUT_ENABLED && Date.now() - session.lastUsedAt.getTime() > IDLE_TIMEOUT_MS) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data:  { isActive: false, revokedAt: new Date() },
      })
      return NextResponse.redirect(loginUrl)
    }

    const newAccessToken = generateAccessToken({
      id: session.admin.id,
      email: session.admin.email,
      type: 'admin',
      role: session.admin.role,
      storeId: session.admin.storeId || undefined,
    })

    const newRefreshToken = generateRefreshToken()
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken)

    /* Rotate: revoke old session, create new one */
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { isActive: false, revokedAt: new Date() },
    })

    await prisma.adminSession.create({
      data: {
        adminId: session.admin.id,
        refreshTokenHash: newRefreshTokenHash,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        deviceType: session.deviceType,
        isActive: true,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const destination = new URL(next, req.url)
    const response = NextResponse.redirect(destination)

    response.cookies.set('admin_access_token', newAccessToken, {
      ...cookieOpts,
      maxAge: 15 * 60,
    })

    response.cookies.set('admin_refresh_token', newRefreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('refresh-redirect error:', error)
    return NextResponse.redirect(loginUrl)
  }
}
