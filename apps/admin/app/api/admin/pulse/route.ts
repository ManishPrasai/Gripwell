/**
 * GET /api/admin/pulse
 *
 * The dashboard's cheap "is anything new?" heartbeat. Returns a handful of
 * counts plus a signature string — nothing else. The client polls THIS every
 * ~60s instead of the full /api/admin/data (13 queries, ~42 KB); it only pulls
 * the heavy dataset when the signature changes (or after a write, or on focus).
 *
 * Store managers are scoped to their own store, same as /api/admin/data, so the
 * counts they see match their dashboard badges.
 */
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@nova/database'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_access_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { payload } = await jwtVerify(token, secret).catch(() => ({ payload: null }))
    if (!payload || payload.type !== 'admin') return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const isManager = (payload.role as string) === 'STORE_MANAGER'
    const storeId = payload.storeId as string | undefined
    const scoped = isManager && storeId ? storeId : undefined

    const [unreadMessages, pendingBookings, unansweredReviews, newEnquiries, lastOrder, lastMessage] = await Promise.all([
      prisma.chatMessage.count({
        where: { senderType: 'CUSTOMER', isRead: false, ...(scoped ? { conversation: { storeId: scoped } } : {}) },
      }),
      prisma.appointment.count({
        where: { status: { in: ['PENDING', 'CONFIRMED'] }, ...(scoped ? { storeId: scoped } : {}) },
      }),
      prisma.review.count({
        where: { reply: null, ...(scoped ? { storeId: scoped } : {}) },
      }),
      prisma.enquiry.count({
        where: { status: 'NEW', ...(scoped ? { source: scoped } : {}) },
      }),
      // Newest order/message timestamps let the signature move even when a count
      // nets out unchanged (e.g. one message read, another arrives).
      prisma.order.findFirst({
        where: scoped ? { storeId: scoped } : undefined,
        orderBy: { createdAt: 'desc' }, select: { createdAt: true },
      }),
      prisma.chatMessage.findFirst({
        where: scoped ? { conversation: { storeId: scoped } } : undefined,
        orderBy: { createdAt: 'desc' }, select: { createdAt: true },
      }),
    ])

    const counts = { unreadMessages, pendingBookings, unansweredReviews, newEnquiries }
    const signature = [
      unreadMessages, pendingBookings, unansweredReviews, newEnquiries,
      lastOrder?.createdAt.getTime() ?? 0,
      lastMessage?.createdAt.getTime() ?? 0,
    ].join(':')

    return NextResponse.json({ counts, signature })
  } catch (err) {
    console.error('admin/pulse error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
