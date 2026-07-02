/**
 * POST /api/auth/totp/confirm
 *
 * Called after the admin has scanned the QR code and entered a valid
 * 6-digit code to prove their authenticator is set up correctly.
 *
 * On success:
 *  - Encrypts the TOTP secret and saves it to AdminUser
 *  - Sets totpEnabled = true
 *  - Generates 8 one-time recovery codes, stores SHA-256 hashes in DB
 *  - Returns the plaintext recovery codes (shown ONCE — never again)
 *
 * Body: { secret: string (base32), code: string (6-digit) }
 * Requires: valid admin_access_token cookie.
 */
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@nova/database'
import {
  encryptSecret,
  verifyTotpCode,
  generateRecoveryCodes,
} from '../../../../../lib/totp'
import * as OTPAuth from 'otpauth'

const joseSecret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

export async function POST(req: NextRequest) {
  try {
    /* 1 — Auth check */
    const token = req.cookies.get('admin_access_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { payload } = await jwtVerify(token, joseSecret).catch(() => ({ payload: null }))
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const adminId = payload.id as string
    const { secret: base32Secret, code } = await req.json()

    if (!base32Secret || !code) {
      return NextResponse.json({ error: 'Missing secret or code' }, { status: 400 })
    }

    /* 2 — Verify the 6-digit code against the provided secret
           (secret not in DB yet — verify before saving) */
    const totp = new OTPAuth.TOTP({
      issuer:    'Nova Tyres Admin',
      algorithm: 'SHA1',
      digits:    6,
      period:    30,
      secret:    OTPAuth.Secret.fromBase32(base32Secret),
    })
    const delta = totp.validate({ token: code.replace(/\s/g, ''), window: 1 })
    if (delta === null) {
      return NextResponse.json({ error: 'Incorrect code — scan the QR code again and retry' }, { status: 400 })
    }

    /* 3 — Encrypt secret and save; generate recovery codes */
    const encryptedSecret = encryptSecret(base32Secret)
    const { plaintext: codes, hashes } = generateRecoveryCodes()

    await prisma.$transaction([
      /* Remove any old recovery codes first */
      prisma.adminRecoveryCode.deleteMany({ where: { adminId } }),

      /* Save new codes */
      prisma.adminRecoveryCode.createMany({
        data: hashes.map(h => ({ adminId, codeHash: h })),
      }),

      /* Enable TOTP on the admin account */
      prisma.adminUser.update({
        where: { id: adminId },
        data:  { totpSecret: encryptedSecret, totpEnabled: true },
      }),
    ])

    return NextResponse.json({
      success:       true,
      recoveryCodes: codes,  // shown ONCE — instruct the frontend to make this clear
    })
  } catch (err) {
    console.error('totp/confirm error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
