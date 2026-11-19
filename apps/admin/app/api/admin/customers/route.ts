/**
 * GET /api/admin/customers?page=&q=  — paginated customer list (super-admin).
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'
import { requireAdmin, AdminError } from '../../../../lib/mutation'

const PAGE_SIZE = 25

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (admin.scope !== 'all') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url  = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const q    = (url.searchParams.get('q') || '').trim()
    const skip = (page - 1) * PAGE_SIZE

    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' as const } },
            { lastName:  { contains: q, mode: 'insensitive' as const } },
            { email:     { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [rows, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          isActive: true, createdAt: true,
          _count: { select: { orders: true, appointments: true, vehicles: true } },
        },
      }),
      prisma.customer.count({ where }),
    ])

    const customers = rows.map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phone ?? '—',
      active: c.isActive,
      joined: c.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      orders: c._count.orders,
      bookings: c._count.appointments,
      vehicles: c._count.vehicles,
    }))

    return NextResponse.json({
      customers,
      pagination: { page, total, totalPages: Math.ceil(total / PAGE_SIZE), hasMore: page * PAGE_SIZE < total },
    })
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[customers] error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
