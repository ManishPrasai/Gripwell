/**
 * PATCH /api/admin/bookings/[id]  — update a booking's status.
 *
 * Reference implementation of the write contract (see lib/mutation.ts):
 * auth → validate → store-scope check → transactional write → audit → return.
 */
import { z } from 'zod'
import { defineMutation, notFound } from '../../../../../lib/mutation'

const StatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
})

export const PATCH = defineMutation({
  schema:     StatusSchema,
  action:     'BOOKING_STATUS_CHANGED',
  entityType: 'Appointment',
  run: async ({ data, params, tx, assertScope }) => {
    const existing = await tx.appointment.findUnique({
      where:  { id: params.id },
      select: { id: true, storeId: true, status: true },
    })
    if (!existing) throw notFound('Booking not found')

    // Store managers may only change their own store's bookings.
    assertScope(existing.storeId)

    const updated = await tx.appointment.update({
      where: { id: existing.id },
      data:  { status: data.status },
      select: { id: true, status: true, storeId: true },
    })

    return {
      result:   updated,
      entityId: updated.id,
      before:   { status: existing.status },
      after:    { status: updated.status },
    }
  },
})
