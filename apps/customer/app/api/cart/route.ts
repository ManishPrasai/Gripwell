import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'
import { resolveCartCustomerId, attachGuestCookie } from '../../lib/guest-cart'

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
// Add an item. If the row already exists, increments quantity by 1.
// Body: { productId: string, productType: 'tyre'|'wheel', quantity?: number }
export async function POST(req: NextRequest) {
  try {
    const { customerId, guestId, isNew } = await resolveCartCustomerId(req)
    const { productId, productType, quantity = 1 } = await req.json()

    if (!productId || !productType) {
      return NextResponse.json({ error: 'productId and productType are required' }, { status: 400 })
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
// Set an item to a specific quantity. quantity ≤ 0 deletes the row.
// Body: { productId: string, productType: string, quantity: number }
export async function PUT(req: NextRequest) {
  try {
    const { customerId, guestId, isNew } = await resolveCartCustomerId(req)
    const { productId, productType, quantity } = await req.json()

    if (!productId || !productType || quantity == null) {
      return NextResponse.json({ error: 'productId, productType and quantity are required' }, { status: 400 })
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: { customerId, productType, productId },
      })
      return attachGuestCookie(NextResponse.json({ deleted: true }), guestId, isNew)
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
