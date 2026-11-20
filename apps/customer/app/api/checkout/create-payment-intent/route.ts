import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@nova/database'
import { computeDiscount } from '../../../../lib/discount'
import { checkCartLines } from '../../../../lib/order-rules'
import { fittingRate, quoteOrderCents, isVehicleType, MIN_CHARGE_PENCE, type VehicleType } from '../../../../lib/fitting'
import { resolveCartCustomerId, attachGuestCookie } from '../../../lib/guest-cart'

// ── Stripe server client (lazy) ───────────────────────────────────────────────
// Initialised on first request, not at module load, so the build phase never
// calls new Stripe() with an undefined key and the compiler doesn't hang.
let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  // Cloudflare Workers: the SDK must use the fetch HTTP client, not Node http
  // (which hangs on workerd).
  _stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia', httpClient: Stripe.createFetchHttpClient() })
  return _stripe
}

// ── POST /api/checkout/create-payment-intent ──────────────────────────────────
// 1. Load CartItems from DB for this browser's guest cart.
// 2. Look up authoritative prices from Tyre / Wheel tables (never trust client).
// 3. Add fitting fee (prices are VAT-inclusive), create Stripe PaymentIntent.
// 4. Return { clientSecret, totals } so the browser shows exactly what is charged.
export async function POST(req: NextRequest) {
  try {
    const { customerId: userId, guestId, isNew } = await resolveCartCustomerId(req)
    const body = await req.json().catch(() => ({} as any))
    const discountCode = String(body?.discountCode || '').trim()

    // Fitting context from the cart (server re-derives the price — never trusts a
    // client-supplied amount, only the selected vehicle type + fulfilment method).
    const rawVehicle = String(body?.vehicleType || 'passenger')
    const vehicle = isVehicleType(rawVehicle) ? rawVehicle : 'passenger'
    const fulfilMethod = String(body?.method || 'fit') === 'pickup' ? 'pickup' : 'fit'
    const storeId = String(body?.storeId || '').trim()

    // ── 1. Fetch cart rows ────────────────────────────────────────────────────
    const cartItems = await prisma.cartItem.findMany({
      where: { customerId: userId },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // ── 2. Look up prices by slug from product tables ─────────────────────────
    const tyreSlugs  = cartItems.filter(i => i.productType === 'tyre').map(i => i.productId)
    const wheelSlugs = cartItems.filter(i => i.productType === 'wheel').map(i => i.productId)

    const [tyres, wheels] = await Promise.all([
      tyreSlugs.length
        ? prisma.tyre.findMany({
            where:  { slug: { in: tyreSlugs }, isActive: true, deletedAt: null },
            select: { slug: true, price: true },
          })
        : [],
      wheelSlugs.length
        ? prisma.wheel.findMany({
            where:  { slug: { in: wheelSlugs }, isActive: true, deletedAt: null },
            select: { slug: true, price: true },
          })
        : [],
    ])

    // Slug → price, per product type (Decimal → number). Prices come only from
    // the database; nothing the browser sends is used as a price.
    const tyrePrice  = new Map<string, number>(tyres.map(t  => [t.slug, Number(t.price)] as [string, number]))
    const wheelPrice = new Map<string, number>(wheels.map(w => [w.slug, Number(w.price)] as [string, number]))

    // Every line: whole quantity 1–8, per-type limits, live and priced product.
    // A negative, zero, fractional or huge quantity, or an unknown item, is
    // refused here, never charged (lib/order-rules.ts).
    const check = checkCartLines(cartItems, (type, slug) =>
      (type === 'tyre' ? tyrePrice : wheelPrice).get(slug))
    if ('error' in check) {   // `in` narrows even with strict mode off
      return NextResponse.json({ error: check.error, unavailable: check.unavailable }, { status: check.status })
    }
    const lines = check.lines

    // ── 3. Calculate total (same quote function the cart and checkout show) ──
    const subtotalCents = quoteOrderCents({ lines, fittingRate: 0, fit: false }).subtotalCents
    // Wheel positions the customer chose to fit (rest go home). Default: all.
    const rawFit = Number(body?.fitCount)
    const wantFit = Number.isFinite(rawFit) ? rawFit : null

    // ── 3b. Apply discount code (server-authoritative) ────────────────────────
    let discountCents = 0
    let appliedCode = ''
    let discountId = ''
    if (discountCode) {
      const d = await computeDiscount(discountCode, subtotalCents / 100)
      if (d.valid && d.discountAmount) {
        discountCents = Math.round(d.discountAmount * 100)
        appliedCode = d.code ?? ''
        discountId = d.discountId ?? ''
      }
    }

    // ── 3c. Fitting (per-vehicle rate × items fitted). All prices include VAT;
    //  the VAT figure is the share inside the total, never added on top.
    //  Use the chosen store's overrides when present, else app-wide defaults.
    let storePrices: Partial<Record<VehicleType, number>> | null = null
    if (storeId) {
      const rows = await prisma.storeFittingPrice.findMany({
        where: { storeId }, select: { vehicleType: true, price: true },
      })
      if (rows.length) {
        storePrices = {}
        for (const r of rows) if (isVehicleType(r.vehicleType)) storePrices[r.vehicleType] = Number(r.price)
      }
    }
    const rate = fittingRate(vehicle, storePrices)
    const { totalCents, vatCents: VATCents, fittingCents, fitCount } = quoteOrderCents({
      lines, fittingRate: rate, fit: fulfilMethod === 'fit', fitCount: wantFit, discountCents,
    })
    if (totalCents < MIN_CHARGE_PENCE) {
      return NextResponse.json(
        { error: 'This order total is too low to take a card payment. Remove any £0 items and try again.' },
        { status: 400 },
      )
    }

    // ── 4. Create Stripe PaymentIntent ────────────────────────────────────────
    const intent = await getStripe().paymentIntents.create({
      amount:   totalCents,
      currency: 'gbp',
      payment_method_types: ['card'],
      metadata: {
        customerId:  userId,
        environment: 'dev-local',
        itemCount:   cartItems.length,
        discountCode: appliedCode,
        discountId,
        discountCents: String(discountCents),
        VATCents:     String(VATCents),
        fittingCents: String(fittingCents),
        vehicleType:  vehicle,
        fulfilMethod,
        fitCount:     String(fitCount),
      },
    })

    return attachGuestCookie(NextResponse.json({
      clientSecret: intent.client_secret,
      discountApplied: discountCents > 0,
      discountAmount: discountCents / 100,
      code: appliedCode,
      totals: {
        subtotal: subtotalCents / 100,
        fitting:  fittingCents / 100,
        discount: discountCents / 100,
        vat:      VATCents / 100,
        total:    totalCents / 100,
      },
    }), guestId, isNew)
  } catch (err) {
    console.error('[create-payment-intent]', err)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
