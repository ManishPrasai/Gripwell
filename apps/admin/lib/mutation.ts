/**
 * Admin write-route contract.
 *
 * Every mutating admin API route should be built with `defineMutation` so they
 * all share one secure, auditable shape:
 *
 *   requireAdmin (valid session)        → 401 if missing
 *   → Zod validate the body             → 400 if invalid
 *   → run(handler) inside a transaction → business logic + store-scope checks
 *   → logAction audit (before/after)    → tamper trail
 *   → return the updated row
 *
 * The handler receives the authenticated `admin`, the parsed `data`, the route
 * `params`, a transaction client `tx`, and an `assertScope` helper that enforces
 * store-manager data isolation. Throw `AdminError` for any controlled failure.
 */
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { prisma, verifyAccessToken, type Prisma } from '@nova/database'
import { validate } from './validate'
import { logAction, type AuditAction } from './audit'
import { accessFromToken, can, type PermArea, type PermLevel, type Perms, type Scope } from './rbac'

/* ── Identity ────────────────────────────────────────────────────────────── */

export interface AdminIdentity {
  id:      string
  email:   string
  role:    string                 // 'SUPER_ADMIN' | 'STORE_MANAGER' (coarse backstop)
  storeId: string | undefined     // set for store-scoped roles
  scope:   Scope                  // 'all' | 'store'
  perms:   Perms                  // area → level, from the role
}

/** A controlled failure with an HTTP status — turned into a clean JSON response. */
export class AdminError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'AdminError'
  }
}

export const forbidden = (msg = 'You do not have access to this resource') => new AdminError(403, msg)
export const notFound  = (msg = 'Not found')                                => new AdminError(404, msg)
export const badRequest = (msg = 'Bad request')                             => new AdminError(400, msg)

export function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Read + verify the admin session from the access-token cookie. */
export async function requireAdmin(req: NextRequest): Promise<AdminIdentity> {
  const token = req.cookies.get('admin_access_token')?.value
  const payload = token ? verifyAccessToken(token) : null
  if (!payload || payload.type !== 'admin') {
    throw new AdminError(401, 'Not authenticated')
  }
  const access = accessFromToken(payload as any)
  return {
    id:      payload.id,
    email:   payload.email,
    role:    (payload.role as string) ?? 'STORE_MANAGER',
    storeId: payload.storeId as string | undefined,
    scope:   access.scope,
    perms:   access.perms,
  }
}

/**
 * Enforce store-manager isolation: a STORE_MANAGER may only touch rows that
 * belong to their own store. SUPER_ADMIN is unrestricted.
 */
export function assertStoreScope(admin: AdminIdentity, storeId: string | null | undefined): void {
  if (admin.scope === 'all') return
  if (!admin.storeId || storeId !== admin.storeId) {
    throw forbidden('This record belongs to another store')
  }
}

/** Restrict an action to all-stores (global) roles — e.g. the shared catalog. */
export function assertSuperAdmin(admin: AdminIdentity): void {
  if (admin.scope !== 'all') {
    throw forbidden('Only an all-stores role can perform this action')
  }
}

/** Require a specific permission level for an area (fine-grained RBAC). */
export function assertPermission(admin: AdminIdentity, area: PermArea, level: PermLevel = 2): void {
  if (!can({ scope: admin.scope, perms: admin.perms }, area, level)) {
    throw forbidden(`You don't have permission to ${level === 2 ? 'manage' : 'view'} ${area}`)
  }
}

/* ── Mutation wrapper ────────────────────────────────────────────────────── */

interface MutationContext<TData> {
  data:        TData
  admin:       AdminIdentity
  params:      Record<string, string>
  tx:          Prisma.TransactionClient
  assertScope: (storeId: string | null | undefined) => void
  ip:          string
}

interface MutationResult {
  /** The row/payload to return to the client. */
  result:    unknown
  /** Audit metadata. */
  entityId?: string
  before?:   object | null
  after?:    object | null
}

interface MutationConfig<TData> {
  /** Zod schema for the JSON body. Omit for body-less requests (e.g. DELETE). */
  schema?:    ZodSchema<TData>
  action:     AuditAction
  entityType: string
  run:        (ctx: MutationContext<TData>) => Promise<MutationResult>
}

type RouteContext = { params?: Promise<Record<string, string>> | Record<string, string> }

/** Build a Next.js route handler that follows the write contract. */
export function defineMutation<TData>(cfg: MutationConfig<TData>) {
  return async (req: NextRequest, ctx?: RouteContext): Promise<NextResponse> => {
    try {
      const admin = await requireAdmin(req)

      let data: TData = undefined as TData
      if (cfg.schema) {
        const parsed = await validate(req, cfg.schema)
        if (parsed.error) return parsed.error
        data = parsed.data as TData
      }

      const params = ctx?.params ? await ctx.params : {}
      const ip = getIp(req)

      const out = await prisma.$transaction((tx) =>
        cfg.run({
          data: data as TData,
          admin,
          params,
          tx,
          assertScope: (storeId) => assertStoreScope(admin, storeId),
          ip,
        }),
      )

      // Best-effort audit — never blocks the response.
      await logAction({
        adminId:    admin.id,
        action:     cfg.action,
        entityType: cfg.entityType,
        entityId:   out.entityId,
        before:     out.before ?? undefined,
        after:      out.after ?? undefined,
        ip,
      })

      return NextResponse.json({ success: true, data: out.result })
    } catch (err) {
      if (err instanceof AdminError) {
        return NextResponse.json({ error: err.message }, { status: err.status })
      }
      console.error(`[mutation:${cfg.action}] error:`, err)
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
  }
}
