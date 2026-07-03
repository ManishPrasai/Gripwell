/**
 * Zod validation helper for admin API routes.
 *
 * Returns { data, error } so every route can do:
 *   const { data, error } = await validate(req, MySchema)
 *   if (error) return error   // NextResponse already built
 */
import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'

export async function validate<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      ),
    }
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Validation failed', details: messages },
        { status: 400 }
      ),
    }
  }

  return { data: result.data, error: null }
}

/* ── Reusable field schemas ──────────────────────────────────────────────── */
export const z_email    = z.string().email().toLowerCase().max(254)
export const z_password = z.string().min(8).max(128)
export const z_totp     = z.string().regex(/^\d{6}$/, 'Must be a 6-digit code')
export const z_token    = z.string().min(10).max(2048)
export const z_uuid     = z.string().uuid()

/* ── Route-specific schemas ──────────────────────────────────────────────── */
export const LoginSchema = z.object({
  email:    z_email,
  password: z_password,
})

export const TotpVerifySchema = z.object({
  tempToken:  z_token,
  code:       z.string().min(4).max(12),   // covers both 6-digit and XXXX-XXXX recovery
  isRecovery: z.boolean().optional().default(false),
})

export const TotpConfirmSchema = z.object({
  secret: z.string().min(16).max(64),      // base32 TOTP secret
  code:   z_totp,
})
