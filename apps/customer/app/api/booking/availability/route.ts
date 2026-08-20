/**
 * GET /api/booking/availability?storeId=&date=YYYY-MM-DD
 *
 * Returns the real bookable slots for a store on a date — only slots the admin
 * has left available and that aren't full — plus the list of services.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const url     = new URL(req.url)
    const storeId = url.searchParams.get('storeId') || ''
    const date    = url.searchParams.get('date') || ''
    if (!storeId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'storeId and date (YYYY-MM-DD) are required' }, { status: 400 })
    }

    const [rows, services] = await Promise.all([
      prisma.appointmentSlot.findMany({
        where:   { storeId, date: new Date(date), isAvailable: true },
        orderBy: { time: 'asc' },
        select:  { id: true, time: true, currentBookings: true, maxBookings: true },
      }),
      prisma.service.findMany({
        where:   { isActive: true },
        orderBy: { priceFrom: 'asc' },
        select:  { id: true, name: true, priceFrom: true },
      }),
    ])

    const slots = rows
      .filter(s => s.currentBookings < s.maxBookings)   // not full
      .map(s => ({ id: s.id, time: s.time }))

    return NextResponse.json({
      slots,
      services: services.map(s => ({ id: s.id, name: s.name, priceFrom: Number(s.priceFrom) })),
    })
  } catch (e) {
    console.error('[booking/availability] error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
