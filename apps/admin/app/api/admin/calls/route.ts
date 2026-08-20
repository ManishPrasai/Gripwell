/**
 * POST /api/admin/calls  — log a phone call / enquiry.
 *
 * Stored as an Enquiry (source = store). Store managers log against their own
 * store; a super admin may specify any store via `storeId`.
 */
import { z } from 'zod'
import { defineMutation, badRequest } from '../../../../lib/mutation'

const CallSchema = z.object({
  name:          z.string().trim().min(1).max(120),
  phone:         z.string().trim().min(3).max(40),
  message:       z.string().trim().max(2000).optional().default(''),
  type:          z.enum(['general', 'booking', 'quote', 'missed', 'complaint']).optional().default('general'),
  email:         z.string().email().max(254).optional().or(z.literal('')).default(''),
  regoOrVehicle: z.string().trim().max(120).optional(),
  storeId:       z.string().min(1).optional(),
})

export const POST = defineMutation({
  schema:     CallSchema,
  action:     'ENQUIRY_LOGGED',
  entityType: 'Enquiry',
  run: async ({ data, admin, tx, assertScope }) => {
    // Resolve the store: managers are pinned to their own; admins choose.
    const storeId = admin.role === 'SUPER_ADMIN' ? (data.storeId ?? admin.storeId) : admin.storeId
    if (!storeId) throw badRequest('A store is required to log this call')
    assertScope(storeId)

    const enquiry = await tx.enquiry.create({
      data: {
        name:          data.name,
        phone:         data.phone,
        email:         data.email || '',
        message:       data.message || '',
        regoOrVehicle: data.regoOrVehicle,
        type:          data.type,
        source:        storeId,
        assignedTo:    admin.id,
      },
      select: { id: true, name: true, phone: true, type: true, createdAt: true },
    })

    return {
      result:   enquiry,
      entityId: enquiry.id,
      after:    { name: data.name, phone: data.phone, type: data.type, storeId },
    }
  },
})
