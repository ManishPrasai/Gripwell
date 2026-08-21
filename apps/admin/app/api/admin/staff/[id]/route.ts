/**
 * DELETE /api/admin/staff/[id]  — revoke a team member's access.
 *
 * Soft-deletes the account and kills all their sessions. Guards against
 * removing yourself or the last active super admin.
 */
import { defineMutation, assertPermission, notFound, badRequest } from '../../../../../lib/mutation'

export const DELETE = defineMutation({
  action:     'STAFF_REMOVED',
  entityType: 'AdminUser',
  run: async ({ admin, params, tx, assertScope }) => {
    assertPermission(admin, 'staff', 2)

    if (params.id === admin.id) throw badRequest("You can't remove your own account")

    const target = await tx.adminUser.findUnique({
      where:  { id: params.id },
      select: { id: true, role: true, storeId: true, isActive: true, email: true },
    })
    if (!target || !target.isActive) throw notFound('Staff member not found')

    // Store managers may only remove their own store's staff.
    assertScope(target.storeId)

    // Never orphan the console — keep at least one active super admin.
    if (target.role === 'SUPER_ADMIN') {
      const supers = await tx.adminUser.count({ where: { role: 'SUPER_ADMIN', isActive: true, deletedAt: null } })
      if (supers <= 1) throw badRequest('Cannot remove the last super admin')
    }

    await tx.adminUser.update({ where: { id: params.id }, data: { isActive: false, deletedAt: new Date() } })
    await tx.adminSession.updateMany({
      where: { adminId: params.id, isActive: true },
      data:  { isActive: false, revokedAt: new Date() },
    })

    return { result: { id: params.id, removed: true }, entityId: params.id, before: { email: target.email, active: true } }
  },
})
