/**
 * POST /api/booking  — submit a booking against a real availability slot.
 *
 * Creates a GuestSession + GuestAppointment and fills the slot atomically so
 * two customers can't book the same spot; marks the slot unavailable once full.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const slotId    = String(body?.slotId || '').trim()
    const serviceId = String(body?.serviceId || '').trim()
    const name      = String(body?.name || '').trim()
    const phone     = String(body?.phone || '').trim()
    const email     = String(body?.email || '').trim()
    const vehicle   = String(body?.vehicle || '').trim()

    if (!slotId || !serviceId || !name || !phone) {
      return NextResponse.json({ error: 'Name, phone, service and time slot are required' }, { status: 400 })
    }

    const result = await prisma.$transaction(async tx => {
      const slot = await tx.appointmentSlot.findUnique({
        where:  { id: slotId },
        select: { id: true, storeId: true, isAvailable: true, currentBookings: true, maxBookings: true },
      })
      if (!slot || !slot.isAvailable || slot.currentBookings >= slot.maxBookings) {
        throw new Error('SLOT_UNAVAILABLE')
      }

      const svc = await tx.service.findUnique({ where: { id: serviceId }, select: { id: true } })
      if (!svc) throw new Error('BAD_SERVICE')

      const session = await tx.guestSession.create({
        data: {
          sessionId: crypto.randomUUID(),
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      const appt = await tx.guestAppointment.create({
        data: {
          guestSessionId:    session.id,
          storeId:           slot.storeId,
          appointmentSlotId: slot.id,
          serviceId,
          name, phone, email,
          regoOrVehicle:     vehicle || null,
          status:            'pending',
        },
        select: { id: true },
      })

      const nextCount = slot.currentBookings + 1
      await tx.appointmentSlot.update({
        where: { id: slot.id },
        data:  { currentBookings: nextCount, isAvailable: nextCount < slot.maxBookings },
      })

      return appt
    })

    return NextResponse.json({ success: true, bookingId: result.id, ref: `NV-${result.id.slice(0, 6).toUpperCase()}` })
  } catch (e: any) {
    if (e?.message === 'SLOT_UNAVAILABLE') return NextResponse.json({ error: 'Sorry, that time was just taken. Please pick another.' }, { status: 409 })
    if (e?.message === 'BAD_SERVICE')      return NextResponse.json({ error: 'Please choose a valid service.' }, { status: 400 })
    console.error('[booking] error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
