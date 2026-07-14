/**
 * PATCH /api/admin/booking-slots/[id]  — block or unblock an availability slot.
 *
 * Blocking (isAvailable=false) immediately removes the slot from the customer
 * booking widget. Requires the `bookings` manage permission; store managers may
 * only manage their own store's slots.
 */
import { z } from 'zod'
import { defineMutation, assertPermission, notFound } from '../../../../../lib/mutation'

const SlotSchema = z.object({ isAvailable: z.boolean() })

export const PATCH = defineMutation({
  schema:     SlotSchema,
  action:     'BOOKING_STATUS_CHANGED',
  entityType: 'AppointmentSlot',
  run: async ({ data, admin, params, tx, assertScope }) => {
    assertPermission(admin, 'bookings', 2)

    const slot = await tx.appointmentSlot.findUnique({
      where:  { id: params.id },
      select: { id: true, storeId: true, isAvailable: true, time: true },
    })
    if (!slot) throw notFound('Slot not found')
    assertScope(slot.storeId)

    const updated = await tx.appointmentSlot.update({
      where: { id: slot.id },
      data:  { isAvailable: data.isAvailable },
      select: { id: true, isAvailable: true, time: true },
    })

    return {
      result:   updated,
      entityId: updated.id,
      before:   { isAvailable: slot.isAvailable },
      after:    { isAvailable: updated.isAvailable },
    }
  },
})
