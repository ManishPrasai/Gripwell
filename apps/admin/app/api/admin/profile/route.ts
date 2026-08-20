/**
 * PATCH /api/admin/profile — the signed-in admin updates their own profile.
 *
 * Covers display name, phone, and notification preferences. Email and role are
 * intentionally not editable here (email is the login identity; role is granted
 * by an administrator). Any authenticated admin may edit their own record.
 */
import { z } from 'zod'
import { defineMutation } from '../../../../lib/mutation'

const ProfileSchema = z.object({
  firstName:         z.string().trim().min(1).max(60).optional(),
  lastName:          z.string().trim().min(1).max(60).optional(),
  phone:             z.string().trim().max(40).optional(),
  notificationPrefs: z.record(z.string(), z.boolean()).optional(),
})

export const PATCH = defineMutation({
  schema:     ProfileSchema,
  action:     'PROFILE_UPDATED',
  entityType: 'AdminUser',
  run: async ({ data, admin, tx }) => {
    const before = await tx.adminUser.findUnique({
      where: { id: admin.id },
      select: { firstName: true, lastName: true, phone: true },
    })

    const patch: Record<string, unknown> = {}
    if (data.firstName !== undefined)         patch.firstName         = data.firstName
    if (data.lastName  !== undefined)         patch.lastName          = data.lastName
    if (data.phone     !== undefined)         patch.phone             = data.phone || null
    if (data.notificationPrefs !== undefined) patch.notificationPrefs = data.notificationPrefs

    const updated = await tx.adminUser.update({
      where: { id: admin.id },
      data:  patch,
      select: { id: true, firstName: true, lastName: true, phone: true, notificationPrefs: true },
    })

    return {
      result:   updated,
      entityId: admin.id,
      before,
      after:    { firstName: updated.firstName, lastName: updated.lastName, phone: updated.phone, prefsUpdated: data.notificationPrefs !== undefined },
    }
  },
})
