/**
 * POST /api/admin/roles  — create a custom role.
 * Requires the `roles` manage permission (also gated in middleware).
 */
import { z } from 'zod'
import { defineMutation, assertPermission, badRequest } from '../../../../lib/mutation'

const PermsSchema = z.record(z.number().int().min(0).max(2))

const RoleCreateSchema = z.object({
  name:        z.string().trim().min(1).max(60),
  description: z.string().max(200).optional(),
  color:       z.string().max(20).optional(),
  scope:       z.enum(['all', 'store']).default('store'),
  permissions: PermsSchema.default({}),
})

export const POST = defineMutation({
  schema:     RoleCreateSchema,
  action:     'ROLE_CREATED',
  entityType: 'Role',
  run: async ({ data, admin, tx }) => {
    assertPermission(admin, 'roles', 2)

    const clash = await tx.role.findUnique({ where: { name: data.name }, select: { id: true } })
    if (clash) throw badRequest('A role with that name already exists')

    const role = await tx.role.create({
      data: {
        name:        data.name,
        description: data.description,
        color:       data.color,
        scope:       data.scope,
        permissions: data.permissions,
        isBuiltIn:   false,
      },
    })

    return { result: role, entityId: role.id, after: { name: role.name, scope: role.scope } }
  },
})
