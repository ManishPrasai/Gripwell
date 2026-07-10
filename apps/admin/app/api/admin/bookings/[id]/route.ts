/**
 * PATCH /api/admin/bookings/[id]  — change status and/or reschedule.
 *
 * Reference implementation of the write contract (see lib/mutation.ts):
 * auth → validate → store-scope check → transactional write → audit → return.
 * Store managers may only touch their own store's bookings.
 */
import { z } from 'zod'
import { defineMutation, notFound, badRequest } from '../../../../../lib/mutation'

const BookingPatchSchema = z.object({
  status:   z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  date:     z.string().datetime().optional(),   // ISO date for a reschedule
  timeSlot: z.string().min(1).max(40).optional(),
}).refine(
  (v) => v.status !== undefined || v.date !== undefined || v.timeSlot !== undefined,
  { message: 'Provide a status and/or a new date/timeSlot' },
)

export const PATCH = defineMutation({
  schema:     BookingPatchSchema,
  action:     'BOOKING_STATUS_CHANGED',
  entityType: 'Appointment',
  run: async ({ data, params, tx, assertScope }) => {
    const existing = await tx.appointment.findUnique({
      where:  { id: params.id },
      select: { id: true, storeId: true, status: true, date: true, timeSlot: true },
    })
    if (!existing) throw notFound('Booking not found')

    assertScope(existing.storeId)

    const patch: Record<string, unknown> = {}
    if (data.status   !== undefined) patch.status   = data.status
    if (data.date     !== undefined) patch.date     = new Date(data.date)
    if (data.timeSlot !== undefined) patch.timeSlot = data.timeSlot
    if (Object.keys(patch).length === 0) throw badRequest('Nothing to update')

    const updated = await tx.appointment.update({
      where:  { id: existing.id },
      data:   patch,
      select: { id: true, status: true, storeId: true, date: true, timeSlot: true },
    })

    return {
      result:   updated,
      entityId: updated.id,
      before:   { status: existing.status, date: existing.date, timeSlot: existing.timeSlot },
      after:    { status: updated.status,  date: updated.date,  timeSlot: updated.timeSlot },
    }
  },
})
