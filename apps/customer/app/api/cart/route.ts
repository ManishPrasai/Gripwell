import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'
import { resolveCartCustomerId, attachGuestCookie } from '../../lib/guest-cart'
import { isValidQuantity, MAX_TYRES_PER_ORDER } from '../../../lib/order-rules'

const BAD_QTY = `Quantity must be a whole number from 1 to ${MAX_TYRES_PER_ORDER}.`

/** Only live, priced catalogue items can enter a basket: stale browser carts
    (old site, retired products) must not create rows that later price at £0. */
async function isSellable(productType: unknown, productId: unknown): Promise<boolean> {
  const where = { slug: String(productId), isActive: true, deletedAt: null, price: { gt: 0 } }
  if (productType === 'tyre')  return !!(await prisma.tyre.findFirst({ where, select: { id: true } }))
  if (productType === 'wheel') return !!(await prisma.wheel.findFirst({ where, select: { id: true } }))
  return false
}

// ── GET /api/cart ─────────────────────────────────────────────────────────────
// Returns every CartItem row belonging to this browser's guest cart.
export async function GET(req: NextRequest) {
  try {
    const { customerId, guestId, isNew } = await resolveCartCustomerId(req)
    const items = await prisma.cartItem.findMany({
      where:   { customerId },
      orderBy: { createdAt: 'asc' },
    })
    return attachGuestCookie(NextResponse.json({ items }), guestId, isNew)
  } catch (err) {
    console.error('[cart GET]', err)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// ── POST /api/cart ────────────────────────────────────────────────────────────
// Add an item, or set an existing row to the given quantity (whole number 1–8).
// Body: { productId: string, productType: 'tyre'|'wheel', quantity?: number }
export async function POST(req: NextRequest) {
  try {
    const { customerId, guestId, isNew } = await resolveCartCustomerId(req)
    const { productId, productType, quantity = 1 } = await req.json()

    if (!productId || !productType) {
      return NextResponse.json({ error: 'productId and productType are required' }, { status: 400 })
    }
    if (!isValidQuantity(quantity)) {
      return NextResponse.json({ error: BAD_QTY }, { status: 400 })
    }
    if (!(await isSellable(productType, productId))) {
      return NextResponse.json({ error: 'This product is no longer available.' }, { status: 404 })
    }

    const item = await prisma.cartItem.upsert({
      where: {
        customerId_productType_productId: { customerId, productType, productId },
      },
      update: { quantity },   // set exact quantity, never blindly increment
      create: { customerId, productType, productId, quantity },
    })

    return attachGuestCookie(NextResponse.json({ item }), guestId, isNew)
  } catch (err) {
    console.error('[cart POST]', err)
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 })
  }
}

// ── PUT /api/cart ─────────────────────────────────────────────────────────────
// Set an item to a specific quantity (whole number 1–8). Removing an item is
// DELETE, never a zero or negative quantity.
// Body: { productId: string, productType: string, quantity: number }
export async function PUT(req: NextRequest) {
  try {
    const { customerId, guestId, isNew } = await resolveCartCustomerId(req)
    const { productId, productType, quantity } = await req.json()

    if (!productId || !productType || quantity == null) {
      return NextResponse.json({ error: 'productId, productType and quantity are required' }, { status: 400 })
    }

    if (!isValidQuantity(quantity)) {
      return NextResponse.json({ error: BAD_QTY }, { status: 400 })
    }
    if (!(await isSellable(productType, productId))) {
      return NextResponse.json({ error: 'This product is no longer available.' }, { status: 404 })
    }

    const item = await prisma.cartItem.upsert({
      where: {
        customerId_productType_productId: { customerId, productType, productId },
      },
      update: { quantity },
      create: { customerId, productType, productId, quantity },
    })

    return attachGuestCookie(NextResponse.json({ item }), guestId, isNew)
  } catch (err) {
    console.error('[cart PUT]', err)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
// With body { productId, productType }: removes that single row.
// With empty body:                      clears this browser's entire guest cart.
export async function DELETE(req: NextRequest) {
  try {
    const { customerId, guestId, isNew } = await resolveCartCustomerId(req)
    const body = await req.json().catch(() => ({}))
    const { productId, productType } = body as { productId?: string; productType?: string }

    if (productId && productType) {
      await prisma.cartItem.deleteMany({
        where: { customerId, productType, productId },
      })
    } else {
      await prisma.cartItem.deleteMany({ where: { customerId } })
    }

    return attachGuestCookie(NextResponse.json({ ok: true }), guestId, isNew)
  } catch (err) {
    console.error('[cart DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete item(s)' }, { status: 500 })
  }
}
