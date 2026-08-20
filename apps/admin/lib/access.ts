/**
 * Resolve an admin's effective access (scope + perms) from their loaded role,
 * for embedding into the access token at login / refresh time.
 *
 * Uses the custom Role when assigned; otherwise falls back to the built-in
 * defaults derived from the AdminRole enum.
 */
import { defaultAccess, type Access, type Perms } from './rbac'

export interface AdminWithRole {
  role: string
  customRole?: { scope: string; permissions: unknown } | null
}

export function resolveAccess(admin: AdminWithRole): Access {
  if (admin.customRole) {
    return {
      scope: admin.customRole.scope === 'all' ? 'all' : 'store',
      perms: (admin.customRole.permissions ?? {}) as Perms,
    }
  }
  return defaultAccess(admin.role)
}
