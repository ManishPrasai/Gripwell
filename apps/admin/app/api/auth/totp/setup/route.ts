/**
 * POST /api/auth/totp/setup
 *
 * Called from the Settings page by an authenticated admin who wants to
 * enroll in TOTP. Returns a QR code data URL and the raw secret (for
 * manual entry in authenticator apps that don't support QR scanning).
 *
 * Does NOT save anything yet — that happens in /api/auth/totp/confirm
 * once the admin proves they can generate a valid code.
 *
 * Requires: valid admin_access_token cookie.
 */
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { generateTotpSecret } from '../../../../../lib/totp'
import QRCode from 'qrcode'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

export async function POST(req: NextRequest) {
  try {
    /* Verify the admin is authenticated */
    const token = req.cookies.get('admin_access_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { payload } = await jwtVerify(token, secret).catch(() => ({ payload: null }))
    if (!payload || payload.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { secret: totpSecret, uri } = generateTotpSecret()

    /* Generate a QR code as a data URL (PNG, ~200px) */
    const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 1 })

    return NextResponse.json({
      secret:   totpSecret,   // base32 — for manual entry
      qrCode:   qrDataUrl,    // data:image/png;base64,... — for QR scan
    })
  } catch (err) {
    console.error('totp/setup error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
