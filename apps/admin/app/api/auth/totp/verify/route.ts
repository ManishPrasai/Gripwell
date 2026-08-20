import { NextRequest, NextResponse } from 'next/server'
import { prisma, generateAccessToken, generateRefreshToken, hashRefreshToken } from '@nova/database'
import { verifyTotpPendingToken, verifyTotpCode, hashRecoveryCode } from '../../../../../lib/totp'
import { validate, TotpVerifySchema } from '../../../../../lib/validate'
import { logAction } from '../../../../../lib/audit'

const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path:     '/',
}

export async function POST(req: NextRequest) {
  try {
    /* ── Zod validation ──────────────────────────────────────────────────── */
    const { data, error } = await validate(req, TotpVerifySchema)
    if (error) return error

    const { tempToken, code, isRecovery } = data
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'

    /* ── Verify pending token ────────────────────────────────────────────── */
    const pending = verifyTotpPendingToken(tempToken)
    if (!pending) {
      return NextResponse.json({ error: 'Code expired — please sign in again' }, { status: 401 })
    }

    const admin = await prisma.adminUser.findUnique({
      where:   { id: pending.adminId },
      include: { store: true },
    })
    if (!admin || !admin.isActive || !admin.totpEnabled || !admin.totpSecret) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    /* ── Recovery code path ──────────────────────────────────────────────── */
    if (isRecovery) {
      const hash = hashRecoveryCode(code)
      const recoveryRow = await prisma.adminRecoveryCode.findFirst({
        where: { adminId: admin.id, codeHash: hash, usedAt: null },
      })
      if (!recoveryRow) {
        return NextResponse.json({ error: 'Invalid or already-used recovery code' }, { status: 401 })
      }
      await prisma.$transaction([
        prisma.adminRecoveryCode.update({ where: { id: recoveryRow.id }, data: { usedAt: new Date() } }),
        prisma.adminUser.update({ where: { id: admin.id }, data: { totpEnabled: false, totpSecret: null } }),
      ])
      await logAction({ adminId: admin.id, action: 'TOTP_RECOVERY_USED', entityType: 'AdminUser', entityId: admin.id, ip })
      const response = await issueSession(admin, ip, req)
      response.headers.set('x-totp-recovery-used', '1')
      return response
    }

    /* ── Normal TOTP path ────────────────────────────────────────────────── */
    if (!verifyTotpCode(admin.totpSecret, code)) {
      return NextResponse.json({ error: 'Incorrect code — try again' }, { status: 401 })
    }

    await logAction({ adminId: admin.id, action: 'LOGIN', entityType: 'AdminUser', entityId: admin.id, ip })
    return issueSession(admin, ip, req)

  } catch (err) {
    console.error('totp/verify error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

async function issueSession(admin: any, ip: string, req: NextRequest) {
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

  const response = NextResponse.json({
    success: true,
    admin: { id: admin.id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email, role: admin.role, storeId: admin.storeId, store: admin.store },
  })
  response.cookies.set('admin_access_token',  accessToken,  { ...cookieOpts, maxAge: 30 * 60           })
  response.cookies.set('admin_refresh_token', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 })
  return response
}
