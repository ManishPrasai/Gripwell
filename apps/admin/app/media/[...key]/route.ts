/**
 * GET /media/<key> — serve a product image out of the NOVA_MEDIA KV namespace.
 *
 * Public and unauthenticated by design: these are catalog photos shown on the
 * storefront. The storefront Worker serves the identical route from the same
 * namespace, which is why stored URLs can stay relative.
 *
 * Keys are random UUIDs and an image is never rewritten in place — an edit
 * uploads a new key — so responses are safely immutable.
 */
import { NextRequest, NextResponse } from 'next/server'
import { mediaKV } from '../../../lib/media'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await ctx.params
  const key = (segments ?? []).join('/')

  if (!key || key.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  const kv = mediaKV()
  if (!kv) return new NextResponse('Image storage unavailable', { status: 503 })

  const { value, metadata } = await kv.getWithMetadata<{ contentType?: string }>(
    key,
    { type: 'arrayBuffer' },
  )
  if (!value) return new NextResponse('Not found', { status: 404 })

  return new NextResponse(value, {
    headers: {
      'Content-Type':  metadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
