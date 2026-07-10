/**
 * POST /api/discounts/validate  { code, subtotal }
 *
 * Validates a promo code created in the admin console against the live rules
 * (active, not expired, under max uses, meets min order) and returns the
 * computed discount amount. Called from the checkout before payment.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const code = String(body?.code || '').trim().toUpperCase()
    const subtotal = Number(body?.subtotal) || 0
    if (!code) return NextResponse.json({ valid: false, error: 'Enter a code' }, { status: 200 })

    const d = await prisma.discount.findUnique({ where: { code } })
    if (!d || !d.isActive || d.deletedAt) {
      return NextResponse.json({ valid: false, error: 'Invalid or inactive code' }, { status: 200 })
    }
    if (d.expiresAt && d.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'This code has expired' }, { status: 200 })
    }
    if (d.maxUses != null && d.currentUses >= d.maxUses) {
      return NextResponse.json({ valid: false, error: 'This code has been fully redeemed' }, { status: 200 })
    }
    if (d.minOrderAmount != null && subtotal < Number(d.minOrderAmount)) {
      return NextResponse.json({ valid: false, error: `Minimum order of $${Number(d.minOrderAmount)} required` }, { status: 200 })
    }

    const raw = d.type === 'percent' ? subtotal * (Number(d.value) / 100) : Number(d.value)
    const discountAmount = Math.round(Math.min(raw, subtotal) * 100) / 100

    return NextResponse.json({
      valid: true,
      code: d.code,
      type: d.type,
      value: Number(d.value),
      discountAmount,
    })
  } catch (e) {
    console.error('[discounts/validate] error:', e)
    return NextResponse.json({ valid: false, error: 'Something went wrong' }, { status: 500 })
  }
}
