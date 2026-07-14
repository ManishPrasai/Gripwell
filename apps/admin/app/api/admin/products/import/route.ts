/**
 * POST /api/admin/products/import
 *
 * Bulk-create catalog products from parsed CSV rows (or a single manual add).
 * Super-admin only — the Tyre/Wheel catalog is shared across all stores.
 *
 * Resilient by design: each row is created independently, so a bad row is
 * reported (row number + reason) rather than rolling back the whole batch.
 * Only Tyres and Wheels have catalog tables; other categories are skipped
 * with a clear reason.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@nova/database'
import { requireAdmin, assertSuperAdmin, AdminError, getIp } from '../../../../../lib/mutation'
import { logAction } from '../../../../../lib/audit'

const numish = z.union([z.number(), z.string()]).optional()

const RowSchema = z.object({
  name:        z.string().trim().min(1),
  brand:       z.string().trim().optional().default(''),
  category:    z.string().trim().optional().default('Tyres'),
  price:       numish,
  stock:       numish,
  sku:         z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  // tyre-specific
  size:        z.string().trim().optional().default(''),   // e.g. "225/45R17"
  type:        z.string().trim().optional().default(''),
  // wheel-specific
  diameter:    numish,
  wheelWidth:  numish,
  pcd:         z.string().trim().optional().default(''),
  material:    z.string().trim().optional().default(''),
})

const BodySchema = z.object({ products: z.array(RowSchema).min(1).max(500) })

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'product'
const rand = (n = 5) => Math.random().toString(36).slice(2, 2 + n)
const num  = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

/** Parse "225/45R17" (or "225/45 R17") into its three dimensions. */
function parseSize(s: string): { width: number; profile: number; rimDiameter: number } | null {
  const m = s.replace(/\s/g, '').match(/(\d{3})\/(\d{2})R?(\d{2})/i)
  return m ? { width: +m[1], profile: +m[2], rimDiameter: +m[3] } : null
}

const TYRE_TYPES = ['PASSENGER', 'SUV', 'COMMERCIAL', 'MUD_TERRAIN'] as const
type TyreTypeVal = (typeof TYRE_TYPES)[number]
function tyreType(s: string): TyreTypeVal {
  const u = s.toUpperCase().replace(/[^A-Z]/g, '_')
  if ((TYRE_TYPES as readonly string[]).includes(u)) return u as TyreTypeVal
  if (/SUV|4X4|4WD/i.test(s)) return 'SUV'
  if (/MUD|\bMT\b|OFF/i.test(s)) return 'MUD_TERRAIN'
  if (/COMMERC|VAN|\bLT\b/i.test(s)) return 'COMMERCIAL'
  return 'PASSENGER'
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    assertSuperAdmin(admin)

    const parsed = BodySchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: 'Invalid import payload' }, { status: 400 })

    const rows = parsed.data.products
    const errors: { row: number; name: string; reason: string }[] = []
    let created = 0

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const cat = r.category.toLowerCase()
      try {
        if (cat.startsWith('tyre')) {
          const size = parseSize(r.size)
          if (!size) { errors.push({ row: i + 1, name: r.name, reason: 'Missing/invalid tyre size — expected e.g. 225/45R17' }); continue }
          const ts = await prisma.tyreSize.upsert({
            where:  { width_profile_rimDiameter: size },
            create: size,
            update: {},
          })
          await prisma.tyre.create({
            data: {
              brand: r.brand || r.name.split(' ')[0], model: r.name,
              description: r.description || null, tyreSizeId: ts.id,
              type: tyreType(r.type), price: num(r.price),
              stockQuantity: Math.max(0, Math.round(num(r.stock))),
              slug: `${slugify(`${r.brand}-${r.name}-${r.size}`)}-${rand()}`, isActive: true,
            },
          })
          created++
        } else if (cat.startsWith('wheel')) {
          const dia = Math.round(num(r.diameter))
          if (!dia) { errors.push({ row: i + 1, name: r.name, reason: 'Wheels need a diameter (inches)' }); continue }
          await prisma.wheel.create({
            data: {
              brand: r.brand || r.name.split(' ')[0], model: r.name,
              description: r.description || null,
              diameter: dia, width: num(r.wheelWidth) || 8, pcd: r.pcd || '5x114.3',
              material: r.material || 'Alloy', price: num(r.price),
              stockQuantity: Math.max(0, Math.round(num(r.stock))),
              slug: `${slugify(`${r.brand}-${r.name}-${dia}`)}-${rand()}`, isActive: true,
            },
          })
          created++
        } else {
          errors.push({ row: i + 1, name: r.name, reason: `No catalog table for "${r.category}" — only Tyres and Wheels are supported` })
        }
      } catch (e: any) {
        errors.push({ row: i + 1, name: r.name, reason: (e?.message as string)?.slice(0, 140) || 'Create failed' })
      }
    }

    await logAction({
      adminId: admin.id, action: 'PRODUCTS_IMPORTED', entityType: 'Product',
      after: { created, skipped: errors.length, total: rows.length }, ip: getIp(req),
    })

    return NextResponse.json({
      success: true, created, skipped: errors.length, total: rows.length,
      errors: errors.slice(0, 50),
    })
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[products/import] error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
