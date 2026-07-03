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
import { signTotpPendingToken } from '../../../../lib/totp'
import { validate, LoginSchema } from '../../../../lib/validate'
import { logAction } from '../../../../lib/audit'

export async function POST(req: NextRequest) {
  try {
    /* ── Zod validation ──────────────────────────────────────────────────── */
    const { data, error } = await validate(req, LoginSchema)
    if (error) return error

    const { email, password } = data
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    /* ── Redis sliding-window rate limit (per IP) ────────────────────────── */
    const rateLimit = await checkLoginRateLimit(ip)
    if (!rateLimit.allowed) {
      if (rateLimit.locked) {
        sendLoginLockoutAlert({ ip, attemptedEmail: email, lockedUntil: rateLimit.resetAt }).catch(() => {})
      }
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)) } }
      )
    }

    /* ── Lookup admin account ────────────────────────────────────────────── */
    const admin = await prisma.adminUser.findUnique({
      where: { email },
      include: { store: true },
    })

    if (!admin || !admin.isActive) {
      await prisma.loginAttempt.create({ data: { email, ipAddress: ip, success: false, failReason: 'account_not_found' } })
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    /* ── Verify password ─────────────────────────────────────────────────── */
    const passwordValid = await verifyPassword(password, admin.passwordHash)
    if (!passwordValid) {
      await prisma.loginAttempt.create({ data: { email, ipAddress: ip, success: false, failReason: 'wrong_password' } })
      await logAction({ adminId: admin.id, action: 'LOGIN_FAILED', entityType: 'AdminUser', entityId: admin.id, ip })
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    /* ── Password verified — TOTP gate ───────────────────────────────────── */
    if (admin.totpEnabled) {
      await clearLoginRateLimit(ip)
      const tempToken = signTotpPendingToken(admin.id, admin.email)
      return NextResponse.json({ requiresTotp: true, tempToken })
    }

    /* ── No TOTP — issue full session ────────────────────────────────────── */
    await clearLoginRateLimit(ip)

    const accessToken      = generateAccessToken({ id: admin.id, email: admin.email, type: 'admin', role: admin.role, storeId: admin.storeId || undefined })
    const refreshToken     = generateRefreshToken()
    const refreshTokenHash = hashRefreshToken(refreshToken)
    const userAgent        = req.headers.get('user-agent') || ''

    await prisma.adminSession.create({
      data: {
        adminId: admin.id, refreshTokenHash, userAgent, ipAddress: ip,
        deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        isActive: true, lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
    await prisma.loginAttempt.create({ data: { email, ipAddress: ip, success: true, failReason: null } })

    /* ── Audit log ───────────────────────────────────────────────────────── */
    await logAction({ adminId: admin.id, action: 'LOGIN', entityType: 'AdminUser', entityId: admin.id, ip })

    const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' }
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email, role: admin.role, storeId: admin.storeId, store: admin.store },
    })
    response.cookies.set('admin_access_token',  accessToken,  { ...cookieOpts, maxAge: 30 * 60           })
    response.cookies.set('admin_refresh_token', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 })
    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
