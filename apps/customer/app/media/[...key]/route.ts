/**
 * GET /media/<key> — serve a product image out of the NOVA_MEDIA KV namespace.
 *
 * Product photos are uploaded in the admin console, which writes to this same
 * namespace and stores a relative `/media/...` path on the Tyre/Wheel image
 * row. Serving that path here is what makes those relative URLs resolve on the
 * storefront.
 *
 * Keys are random UUIDs and an image is never rewritten in place — an edit
 * uploads a new key — so responses are safely immutable.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const dynamic = 'force-dynamic'

/**
 * Minimal structural type for the KV binding — `@cloudflare/workers-types` is
 * not a dependency here, and a read is all the storefront ever does.
 */
interface MediaKV {
  getWithMetadata<M = unknown>(
    key: string,
    options: { type: 'arrayBuffer' },
  ): Promise<{ value: ArrayBuffer | null; metadata: M | null }>
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await ctx.params
  const key = (segments ?? []).join('/')

  if (!key || key.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  let kv: MediaKV | null = null
  try {
    kv = (getCloudflareContext().env as unknown as Record<string, MediaKV | undefined>)
      ?.NOVA_MEDIA ?? null
  } catch {
    // Not inside a Cloudflare request context (plain `next dev`).
    kv = null
  }
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
