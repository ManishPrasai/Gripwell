/**
 * POST /api/admin/staff  — create a team member with a temporary password.
 *
 * Requires the `staff` manage permission. The new account is forced to change
 * its password on first login (mustChangePassword). The one-time temp password
 * is returned once, for the admin to hand over.
 */
import { z } from 'zod'
import { hashPassword } from '@nova/database'
import { defineMutation, assertPermission, badRequest } from '../../../../lib/mutation'

const StaffCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName:  z.string().trim().min(1).max(60),
  email:     z.string().email().toLowerCase().max(254),
  storeId:   z.string().min(1).optional(),
  roleId:    z.string().min(1).optional(),   // custom role; defaults to Store Manager
})

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, b => chars[b % chars.length]).join('')
}

export const POST = defineMutation({
  schema:     StaffCreateSchema,
  action:     'ADMIN_CREATED',
  entityType: 'AdminUser',
  run: async ({ data, admin, tx }) => {
    assertPermission(admin, 'staff', 2)

    const clash = await tx.adminUser.findUnique({ where: { email: data.email }, select: { id: true } })
    if (clash) throw badRequest('An admin with that email already exists')

    // Resolve the role → scope + enum backstop.
    let scope: 'all' | 'store' = 'store'
    let roleId = data.roleId ?? null
    if (roleId) {
      const role = await tx.role.findUnique({ where: { id: roleId }, select: { scope: true } })
      if (!role) throw badRequest('Selected role not found')
      scope = role.scope === 'all' ? 'all' : 'store'
    } else {
      const mgr = await tx.role.findUnique({ where: { name: 'Store Manager' }, select: { id: true } })
      roleId = mgr?.id ?? null
    }

    // Store managers can only create staff for their own store, store-scoped only.
    if (admin.scope === 'store') {
      if (scope === 'all') throw badRequest('You cannot assign an all-stores role')
      data.storeId = admin.storeId
    }

    const storeId = scope === 'store' ? (data.storeId ?? admin.storeId ?? null) : (data.storeId ?? null)
    if (scope === 'store' && !storeId) throw badRequest('A store is required for this role')

    const tempPassword = generateTempPassword()
    const passwordHash = await hashPassword(tempPassword)

    const created = await tx.adminUser.create({
      data: {
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        passwordHash,
        role:      scope === 'all' ? 'SUPER_ADMIN' : 'STORE_MANAGER',
        roleId,
        storeId,
        mustChangePassword: true,
        isActive:  true,
      },
      select: { id: true, email: true, firstName: true, lastName: true, storeId: true },
    })

    return {
      result:   { ...created, tempPassword },   // shown once to the creating admin
      entityId: created.id,
      after:    { email: created.email, scope, storeId },
    }
  },
})
