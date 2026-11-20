import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@nova/database'
import { encryptSecret, generateRecoveryCodes } from '../../../../../lib/totp'
import { validate, TotpConfirmSchema } from '../../../../../lib/validate'
import { logAction } from '../../../../../lib/audit'
import * as OTPAuth from 'otpauth'

const joseSecret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

export async function POST(req: NextRequest) {
  try {
    /* â"€â"€ Auth check â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
    const token = req.cookies.get('admin_access_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { payload } = await jwtVerify(token, joseSecret).catch(() => ({ payload: null }))
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }
    const adminId = payload.id as string
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'

    /* â"€â"€ Zod validation â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
    const { data, error } = await validate(req, TotpConfirmSchema)
    if (error) return error

    const { secret: base32Secret, code } = data

    /* â"€â"€ Verify 6-digit code against new secret (before saving) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
    const totp = new OTPAuth.TOTP({
      issuer: 'Gripwell Admin', algorithm: 'SHA1', digits: 6, period: 30,
      secret: OTPAuth.Secret.fromBase32(base32Secret),
    })
    if (totp.validate({ token: code.replace(/\s/g, ''), window: 1 }) === null) {
      return NextResponse.json({ error: 'Incorrect code â" scan the QR code again and retry' }, { status: 400 })
    }

    /* â"€â"€ Save encrypted secret + recovery codes atomically â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
    const encryptedSecret = encryptSecret(base32Secret)
    const { plaintext: codes, hashes } = generateRecoveryCodes()

    await prisma.$transaction([
      prisma.adminRecoveryCode.deleteMany({ where: { adminId } }),
      prisma.adminRecoveryCode.createMany({ data: hashes.map(h => ({ adminId, codeHash: h })) }),
      prisma.adminUser.update({ where: { id: adminId }, data: { totpSecret: encryptedSecret, totpEnabled: true } }),
    ])

    /* â"€â"€ Audit log â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
    await logAction({ adminId, action: 'TOTP_ENROLLED', entityType: 'AdminUser', entityId: adminId, ip })

    return NextResponse.json({ success: true, recoveryCodes: codes })

  } catch (err) {
    console.error('totp/confirm error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
