/**
 * GET /media/<key> — serve a product image off local disk.
 *
 * Product photos are uploaded in the admin console, which writes into
 * MEDIA_DIR — a directory shared with this container via a Docker volume
 * (see docker-compose.yaml) — and stores a relative `/media/...` path on the
 * Tyre/Wheel image row. Serving that same path here is what makes those
 * relative URLs resolve on the storefront.
 *
 * Keys are random UUIDs and an image is never rewritten in place — an edit
 * uploads a new key — so responses are safely immutable.
 */
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), '.media')

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  webp: 'image/webp',
  jpg:  'image/jpeg',
  png:  'image/png',
  avif: 'image/avif',
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await ctx.params
  const key = (segments ?? []).join('/')

  if (!key || key.includes('..')) {
    return new NextResponse('Not found', { status: 404 })
  }

  let buf: Buffer
  try {
    buf = await fs.readFile(path.join(MEDIA_DIR, key))
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext = key.split('.').pop()?.toLowerCase() ?? ''
  const contentType = CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream'

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type':  contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
