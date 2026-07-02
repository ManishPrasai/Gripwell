import { NextRequest, NextResponse } from 'next/server'
import {
  prisma,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '@nova/database'
import { checkLoginRateLimit, clearLoginRateLimit } from '../../../../lib/rateLimit'
import { sendLoginLockoutAlert } from '../../../../lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    /* ── Redis sliding-window rate limit (per IP) ────────────────────── */
    const rateLimit = await checkLoginRateLimit(ip)

    if (!rateLimit.allowed) {
      /* First time we hit the limit — send security alert email */
      if (rateLimit.locked) {
        sendLoginLockoutAlert({
          ip,
          attemptedEmail: email.toLowerCase(),
          lockedUntil:    rateLimit.resetAt,
        }).catch(() => {}) // fire-and-forget, never block the response
      }

      const retryAfterSecs = Math.ceil(
        (rateLimit.resetAt.getTime() - Date.now()) / 1000
      )

      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSecs) },
        }
      )
    }

    /* ── Lookup admin account ──────────────────────────────────────────── */
    const admin = await prisma.adminUser.findUnique({
      where:   { email: email.toLowerCase() },
      include: { store: true },
    })

    if (!admin || !admin.isActive) {
      await prisma.loginAttempt.create({
        data: {
          email:     email.toLowerCase(),
          ipAddress: ip,
          success:   false,
          failReason: 'account_not_found',
        },
      })

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    /* ── Verify password ───────────────────────────────────────────────── */
    const passwordValid = await verifyPassword(password, admin.passwordHash)

    if (!passwordValid) {
      await prisma.loginAttempt.create({
        data: {
          email:     email.toLowerCase(),
          ipAddress: ip,
          success:   false,
          failReason: 'wrong_password',
        },
      })

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    /* ── Success — clear rate-limit state, issue session ──────────────── */
    await clearLoginRateLimit(ip)

    const accessToken      = generateAccessToken({
      id:      admin.id,
      email:   admin.email,
      type:    'admin',
      role:    admin.role,
      storeId: admin.storeId || undefined,
    })
    const refreshToken     = generateRefreshToken()
    const refreshTokenHash = hashRefreshToken(refreshToken)
    const userAgent        = req.headers.get('user-agent') || ''

    await prisma.adminSession.create({
      data: {
        adminId:          admin.id,
        refreshTokenHash,
        userAgent,
        ipAddress:        ip,
        deviceType:       userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        isActive:         true,
        lastUsedAt:       new Date(),
        expiresAt:        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.adminUser.update({
      where: { id: admin.id },
      data:  { lastLoginAt: new Date() },
    })

    await prisma.loginAttempt.create({
      data: {
        email:      email.toLowerCase(),
        ipAddress:  ip,
        success:    true,
        failReason: null,
      },
    })

    const cookieOpts = {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path:     '/',
    }

    const response = NextResponse.json({
      success: true,
      admin: {
        id:       admin.id,
        firstName: admin.firstName,
        lastName:  admin.lastName,
        email:    admin.email,
        role:     admin.role,
        storeId:  admin.storeId,
        store:    admin.store,
      },
    })

    response.cookies.set('admin_access_token',  accessToken,  { ...cookieOpts, maxAge: 15 * 60            })
    response.cookies.set('admin_refresh_token', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60  })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
