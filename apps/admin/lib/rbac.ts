/**
 * RBAC primitives — pure, dependency-free so the Edge middleware can import it.
 *
 * Access = a `scope` ('all' | 'store') + a `perms` map of area → level.
 *   level 0 = none, 1 = view, 2 = manage.
 *
 * Every admin resolves to one of these, either from their custom Role or, for
 * built-in roles / legacy tokens without embedded perms, derived from the
 * AdminRole enum via `defaultAccess`.
 */
export const PERM_AREAS = [
  'stores', 'bookings', 'messages', 'inventory',
  'staff', 'reviews', 'website', 'finance', 'roles',
] as const

export type PermArea  = (typeof PERM_AREAS)[number]
export type PermLevel = 0 | 1 | 2
export type Scope     = 'all' | 'store'
export type Perms     = Record<string, PermLevel>

export interface Access {
  scope: Scope
  perms: Perms
}

export const BUILTIN_SUPER_ADMIN_PERMS: Perms = {
  stores: 2, bookings: 2, messages: 2, inventory: 2, staff: 2, reviews: 2, website: 2, finance: 2, roles: 2,
}

export const BUILTIN_STORE_MANAGER_PERMS: Perms = {
  stores: 1, bookings: 2, messages: 2, inventory: 2, staff: 2, reviews: 2, website: 1, finance: 1, roles: 0,
}

/** Fallback access for the built-in AdminRole enum (and legacy tokens). */
export function defaultAccess(roleEnum: string | undefined): Access {
  if (roleEnum === 'SUPER_ADMIN') return { scope: 'all',   perms: BUILTIN_SUPER_ADMIN_PERMS }
  return { scope: 'store', perms: BUILTIN_STORE_MANAGER_PERMS }
}

/** Resolve access from a token payload (embedded perms) or the role fallback. */
export function accessFromToken(payload: { scope?: string; perms?: Perms; role?: string }): Access {
  if (payload?.perms && payload?.scope) {
    return { scope: payload.scope === 'all' ? 'all' : 'store', perms: payload.perms }
  }
  return defaultAccess(payload?.role)
}

/** True if the access allows `area` at ≥ `level`. */
export function can(access: Access | undefined, area: PermArea, level: PermLevel): boolean {
  return (access?.perms?.[area] ?? 0) >= level
}
