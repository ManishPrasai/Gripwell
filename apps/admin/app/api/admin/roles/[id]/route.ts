/**
 * PATCH  /api/admin/roles/[id]  — edit a custom role
 * DELETE /api/admin/roles/[id]  — delete a custom role
 *
 * Built-in roles (Super Admin, Store Manager) are locked. Deleting a role
 * detaches its members, who fall back to their built-in enum access.
 */
import { z } from 'zod'
import { defineMutation, assertPermission, notFound, forbidden } from '../../../../../lib/mutation'

const PermsSchema = z.record(z.number().int().min(0).max(2))

const RolePatchSchema = z.object({
  name:        z.string().trim().min(1).max(60).optional(),
  description: z.string().max(200).optional(),
  color:       z.string().max(20).optional(),
  scope:       z.enum(['all', 'store']).optional(),
  permissions: PermsSchema.optional(),
})

export const PATCH = defineMutation({
  schema:     RolePatchSchema,
  action:     'ROLE_UPDATED',
  entityType: 'Role',
  run: async ({ data, admin, params, tx }) => {
    assertPermission(admin, 'roles', 2)

    const role = await tx.role.findUnique({ where: { id: params.id } })
    if (!role) throw notFound('Role not found')
    if (role.isBuiltIn) throw forbidden('Built-in roles cannot be edited')

    const patch: Record<string, unknown> = {}
    if (data.name        !== undefined) patch.name        = data.name
    if (data.description !== undefined) patch.description = data.description
    if (data.color       !== undefined) patch.color       = data.color
    if (data.scope       !== undefined) patch.scope       = data.scope
    if (data.permissions !== undefined) patch.permissions = data.permissions

    const updated = await tx.role.update({ where: { id: params.id }, data: patch })

    return {
      result:   updated,
      entityId: updated.id,
      before:   { name: role.name, scope: role.scope, permissions: role.permissions },
      after:    { name: updated.name, scope: updated.scope, permissions: updated.permissions },
    }
  },
})

export const DELETE = defineMutation({
  action:     'ROLE_DELETED',
  entityType: 'Role',
  run: async ({ admin, params, tx }) => {
    assertPermission(admin, 'roles', 2)

    const role = await tx.role.findUnique({
      where:  { id: params.id },
      include: { _count: { select: { admins: true } } },
    })
    if (!role) throw notFound('Role not found')
    if (role.isBuiltIn) throw forbidden('Built-in roles cannot be deleted')

    // Detach members — they revert to their built-in enum access.
    await tx.adminUser.updateMany({ where: { roleId: params.id }, data: { roleId: null } })
    await tx.role.delete({ where: { id: params.id } })

    return {
      result:   { id: params.id, deleted: true, reassigned: role._count.admins },
      entityId: params.id,
      before:   { name: role.name },
    }
  },
})
