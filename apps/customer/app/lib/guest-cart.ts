import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'
import { randomUUID } from 'crypto'

/* Anonymous, per-browser cart identity. CartItem.customerId is a required FK,
   so every visitor still needs a real Customer row — but each browser gets its
   own via an unguessable httpOnly cookie instead of all traffic sharing one
   hardcoded customer (which let any visitor's cart clobber every other
   visitor's, and let anyone read/write anyone else's cart directly via the
   API). */

const COOKIE_NAME = 'guest_cart_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 days

export async function resolveCartCustomerId(
  req: NextRequest,
): Promise<{ customerId: string; guestId: string; isNew: boolean }> {
  const existing = req.cookies.get(COOKIE_NAME)?.value
  const isNew = !existing
  const guestId = existing ?? randomUUID()

  const customer = await prisma.customer.upsert({
    where: { email: `guest+${guestId}@cart.gripwell.local` },
    update: {},
    create: {
      firstName:    'Guest',
      lastName:     'Customer',
      email:        `guest+${guestId}@cart.gripwell.local`,
      passwordHash: 'guest:cart',
    },
    select: { id: true },
  })

  return { customerId: customer.id, guestId, isNew }
}

export function attachGuestCookie(res: NextResponse, guestId: string, isNew: boolean): NextResponse {
  if (isNew) {
    res.cookies.set(COOKIE_NAME, guestId, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   COOKIE_MAX_AGE,
      path:     '/',
    })
  }
  return res
}

/* Find-or-create a real Customer by the email collected at checkout, so a paid
   order is attributed to an identifiable customer rather than left on the
   anonymous guest-cart placeholder. Mirrors the find-or-create-by-email
   pattern already used in /api/auth/google/callback and /api/auth/register —
   if the email already belongs to a real registered customer, the order
   correctly attaches to that existing account instead of creating a new one. */
export async function resolveOrderCustomerId(email: string, name: string, fallbackId: string): Promise<string> {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return fallbackId

  const [firstName, ...rest] = name.trim().split(' ').filter(Boolean)
  const customer = await prisma.customer.upsert({
    where: { email: trimmed },
    update: {},
    create: {
      firstName:    firstName || 'Customer',
      lastName:     rest.join(' '),
      email:        trimmed,
      passwordHash: 'guest:checkout',
    },
    select: { id: true },
  })
  return customer.id
}
