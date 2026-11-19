import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { resolveCartCustomerId } from '../../../lib/guest-cart'

// ── POST /api/checkout/notes ──────────────────────────────────────────────────
// Body: { paymentIntentId, notes }. Stores the order notes on the PaymentIntent
// metadata just before the card is confirmed, so whichever route records the
// order (the success route, or the Stripe webhook if the browser never gets
// back) saves them.
const MAX_NOTES = 300   // route files may only export handlers

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  _stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia', httpClient: Stripe.createFetchHttpClient() })
  return _stripe
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const paymentIntentId = String(body?.paymentIntentId || '')
    const notes = typeof body?.notes === 'string' ? body.notes.trim().slice(0, MAX_NOTES) : ''
    if (!paymentIntentId.startsWith('pi_')) {
      return NextResponse.json({ error: 'Missing paymentIntentId.' }, { status: 400 })
    }

    // Only the cart that created the PaymentIntent may change it, and only before it is paid.
    const { customerId } = await resolveCartCustomerId(req)
    const intent = await getStripe().paymentIntents.retrieve(paymentIntentId)
    if (intent.metadata?.customerId !== customerId) {
      return NextResponse.json({ error: 'Payment does not belong to this cart.' }, { status: 403 })
    }
    if (intent.status === 'succeeded' || intent.status === 'canceled') {
      return NextResponse.json({ error: 'Payment is already complete.' }, { status: 409 })
    }

    await getStripe().paymentIntents.update(paymentIntentId, { metadata: { notes } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[checkout/notes]', err)
    return NextResponse.json({ error: 'Could not save order notes.' }, { status: 500 })
  }
}
