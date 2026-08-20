/**
 * Product image gallery — list, attach and detach.
 *
 *   GET    /api/admin/products/[id]/images         — current gallery, in order
 *   POST   /api/admin/products/[id]/images         — attach an uploaded URL
 *   DELETE /api/admin/products/[id]/images?imageId=…
 *
 * The id may belong to either the Tyre or the Wheel table (one shared catalog),
 * so every handler resolves which one it is first. Super-admin only, matching
 * the rest of the catalog routes.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@nova/database'
import { requireAdmin, assertSuperAdmin, AdminError, getIp } from '../../../../../../lib/mutation'
import { logAction } from '../../../../../../lib/audit'
import { mediaKV, urlToKey, MEDIA_PREFIX } from '../../../../../../lib/media'

/** Cap the gallery so one product can't be given an unbounded image list. */
const MAX_IMAGES_PER_PRODUCT = 8

const AttachSchema = z.object({
  url:     z.string().trim().min(1).max(500),
  altText: z.string().trim().max(200).optional(),
})

type Kind = 'tyre' | 'wheel'

/** Which catalog table owns this id? */
async function resolveKind(id: string): Promise<Kind | null> {
  const tyre = await prisma.tyre.findUnique({ where: { id }, select: { id: true } })
  if (tyre) return 'tyre'
  const wheel = await prisma.wheel.findUnique({ where: { id }, select: { id: true } })
  if (wheel) return 'wheel'
  return null
}

function listImages(kind: Kind, id: string) {
  return kind === 'tyre'
    ? prisma.tyreImage.findMany({
        where: { tyreId: id },
        select: { id: true, url: true, altText: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      })
    : prisma.wheelImage.findMany({
        where: { wheelId: id },
        select: { id: true, url: true, altText: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      })
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req)
    assertSuperAdmin(admin)

    const { id } = await ctx.params
    const kind = await resolveKind(id)
    if (!kind) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: await listImages(kind, id) })
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[products/images] list error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req)
    assertSuperAdmin(admin)

    const { id } = await ctx.params
    const parsed = AttachSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'An image URL is required' }, { status: 400 })
    }
    const { url, altText } = parsed.data

    // Only paths we serve ourselves. Blocks an arbitrary external URL (or a
    // javascript:/data: string) being written into the storefront's <img src>.
    if (!url.startsWith(MEDIA_PREFIX) && !url.startsWith('/images/')) {
      return NextResponse.json(
        { error: 'Image must be uploaded through the admin console' },
        { status: 400 },
      )
    }

    const kind = await resolveKind(id)
    if (!kind) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const existing = await listImages(kind, id)
    if (existing.length >= MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { error: `A product can have at most ${MAX_IMAGES_PER_PRODUCT} images` },
        { status: 400 },
      )
    }
    const sortOrder = existing.length ? Math.max(...existing.map(i => i.sortOrder)) + 1 : 0

    const created = kind === 'tyre'
      ? await prisma.tyreImage.create({
          data: { tyreId: id, url, altText: altText || null, sortOrder },
          select: { id: true, url: true, altText: true, sortOrder: true },
        })
      : await prisma.wheelImage.create({
          data: { wheelId: id, url, altText: altText || null, sortOrder },
          select: { id: true, url: true, altText: true, sortOrder: true },
        })

    await logAction({
      adminId: admin.id, action: 'PRODUCT_IMAGE_ADDED', entityType: 'Product',
      entityId: id, after: { imageId: created.id, url }, ip: getIp(req),
    })

    return NextResponse.json({ success: true, data: created })
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[products/images] attach error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(req)
    assertSuperAdmin(admin)

    const { id } = await ctx.params
    const imageId = req.nextUrl.searchParams.get('imageId')
    if (!imageId) return NextResponse.json({ error: 'imageId is required' }, { status: 400 })

    const kind = await resolveKind(id)
    if (!kind) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // Scope the lookup to this product so an id from another product can't be
    // deleted through it.
    const row = kind === 'tyre'
      ? await prisma.tyreImage.findFirst({ where: { id: imageId, tyreId: id }, select: { id: true, url: true } })
      : await prisma.wheelImage.findFirst({ where: { id: imageId, wheelId: id }, select: { id: true, url: true } })
    if (!row) return NextResponse.json({ error: 'Image not found' }, { status: 404 })

    if (kind === 'tyre') await prisma.tyreImage.delete({ where: { id: imageId } })
    else                 await prisma.wheelImage.delete({ where: { id: imageId } })

    // Drop the stored bytes too, but only for images we host. A failure here is
    // not worth failing the request over — the DB row is already gone, so the
    // worst case is an unreferenced KV object.
    const key = urlToKey(row.url)
    if (key) {
      try { await mediaKV()?.delete(key) } catch (err) {
        console.error('[products/images] KV delete failed:', err)
      }
    }

    await logAction({
      adminId: admin.id, action: 'PRODUCT_IMAGE_REMOVED', entityType: 'Product',
      entityId: id, before: { imageId, url: row.url }, ip: getIp(req),
    })

    return NextResponse.json({ success: true, data: { id: imageId, deleted: true } })
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[products/images] detach error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
