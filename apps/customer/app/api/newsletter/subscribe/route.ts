/**
 * POST /api/newsletter/subscribe  { email }
 *
 * Double opt-in: stores the address unconfirmed and emails a confirm link.
 * Re-subscribing an already-confirmed address is a no-op (still returns
 * success — never reveal whether an address is already on the list to an
 * anonymous caller). An unconfirmed address gets its confirmation re-sent
 * rather than piling up duplicate rows.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'
import { sendNewsletterConfirmation } from '../../../../lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } })

    if (existing?.confirmed) {
      return NextResponse.json({ success: true })
    }

    const subscriber = existing
      ? existing
      : await prisma.subscriber.create({ data: { email } })

    await sendNewsletterConfirmation(email, subscriber.token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[newsletter/subscribe] error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
