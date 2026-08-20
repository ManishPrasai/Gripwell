/**
 * POST /api/discounts/validate  { code, subtotal }
 *
 * Validates a promo code created in the admin console against the live rules
 * (active, not expired, under max uses, meets min order) and returns the
 * computed discount amount. Called from the checkout before payment.
 */
import { NextRequest, NextResponse } from 'next/server'
import { computeDiscount } from '../../../../lib/discount'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const result = await computeDiscount(String(body?.code || ''), Number(body?.subtotal) || 0)
    // Strip the internal id from the public validate response.
    const { discountId, ...pub } = result
    return NextResponse.json(pub, { status: 200 })
  } catch (e) {
    console.error('[discounts/validate] error:', e)
    return NextResponse.json({ valid: false, error: 'Something went wrong' }, { status: 500 })
  }
}
