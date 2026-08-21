/**
 * POST /api/auth/change-password  — set a new password for the logged-in admin.
 *
 * Used both for the forced first-login change (mustChangePassword) and normal
 * self-service changes. Clears the mustChangePassword flag on success.
 */
import { z } from 'zod'
import { hashPassword } from '@nova/database'
import { defineMutation } from '../../../../lib/mutation'

const ChangePwSchema = z.object({
  newPassword: z.string().min(8, 'Use at least 8 characters').max(128),
})

export const POST = defineMutation({
  schema:     ChangePwSchema,
  action:     'PASSWORD_CHANGED',
  entityType: 'AdminUser',
  run: async ({ data, admin, tx }) => {
    const passwordHash = await hashPassword(data.newPassword)
    await tx.adminUser.update({
      where: { id: admin.id },
      data:  { passwordHash, mustChangePassword: false },
    })
    return { result: { changed: true }, entityId: admin.id }
  },
})
