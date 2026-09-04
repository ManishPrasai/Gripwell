/**
 * Product image storage — local disk.
 *
 * Images live under MEDIA_DIR (a directory shared between the admin and
 * customer containers via a Docker volume — see docker-compose.yaml): the
 * admin writes on upload, the storefront reads the same files when serving
 * `/media/*`. A key like `products/<uuid>.webp` resolves to a file at
 * `MEDIA_DIR/products/<uuid>.webp`.
 *
 * Content type is derived from the file extension rather than stored
 * separately — every key this app mints already carries one (see
 * `newMediaKey`), so there's no metadata sidecar to keep in sync.
 *
 * Stored URLs are *relative* (`/media/products/<uuid>.webp`) on purpose: the
 * same string resolves on both the admin and customer apps, since both serve
 * this route against the same shared directory. No custom domain, no CORS,
 * no absolute URL to rewrite if the domain ever changes.
 */
import { promises as fs } from 'fs'
import path from 'path'

/** Shared across both containers via a Docker volume; falls back to a local
 *  folder (gitignored) for plain `next dev`. */
const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), '.media')

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  webp: 'image/webp',
  jpg:  'image/jpeg',
  png:  'image/png',
  avif: 'image/avif',
}

function toBuffer(value: ArrayBuffer | ArrayBufferView | string): Buffer {
  if (typeof value === 'string') return Buffer.from(value)
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength)
  return Buffer.from(value)
}

/** Formats we accept. Anything else is rejected before it reaches storage. */
const ALLOWED = new Map<string, string>([
  ['image/webp', 'webp'],
  ['image/jpeg', 'jpg'],
  ['image/png',  'png'],
  ['image/avif', 'avif'],
])

/**
 * Hard ceiling on a stored image. The admin UI downscales to ~1600px and
 * re-encodes as WebP before uploading, so real product photos land far under
 * this — it exists to stop a pathological file, not to size normal ones.
 * (KV's own per-value limit is 25 MiB.)
 */
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024

export const MEDIA_PREFIX = '/media/'

/**
 * Storage interface kept identical to the previous KV-backed version, so
 * every caller (upload, serve, delete routes) needed zero changes.
 */
export interface MediaKV {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string,
    options?: { metadata?: unknown; expirationTtl?: number },
  ): Promise<void>
  getWithMetadata<M = unknown>(
    key: string,
    options: { type: 'arrayBuffer' },
  ): Promise<{ value: ArrayBuffer | null; metadata: M | null }>
  delete(key: string): Promise<void>
}

class LocalDiskMedia implements MediaKV {
  private resolve(key: string): string {
    return path.join(MEDIA_DIR, key)
  }

  async put(key: string, value: ArrayBuffer | ArrayBufferView | string): Promise<void> {
    const filePath = this.resolve(key)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, toBuffer(value))
  }

  async getWithMetadata<M = unknown>(
    key: string,
  ): Promise<{ value: ArrayBuffer | null; metadata: M | null }> {
    try {
      const buf = await fs.readFile(this.resolve(key))
      const ext = key.split('.').pop()?.toLowerCase() ?? ''
      const contentType = CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream'
      const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
      return { value: arrayBuffer, metadata: { contentType } as unknown as M }
    } catch {
      return { value: null, metadata: null }
    }
  }

  async delete(key: string): Promise<void> {
    try { await fs.unlink(this.resolve(key)) } catch { /* already gone */ }
  }
}

/** Always available — local disk needs no external context, unlike the
 *  Workers KV binding this replaced. */
export function mediaKV(): MediaKV | null {
  return new LocalDiskMedia()
}

export function extensionFor(contentType: string): string | null {
  return ALLOWED.get(contentType.toLowerCase().split(';')[0].trim()) ?? null
}

/** `products/3f2b…-a91c.webp` — random, so a key is never guessable or reused. */
export function newMediaKey(ext: string): string {
  return `products/${crypto.randomUUID()}.${ext}`
}

/** Storage key → the public path we persist in `TyreImage.url`. */
export const keyToUrl = (key: string): string => `${MEDIA_PREFIX}${key}`

/**
 * Public path → storage key, or null if the URL isn't one of ours.
 * Used on delete so we only ever remove objects this app owns, and never
 * follow a seeded `/images/...` static path into KV.
 */
export function urlToKey(url: string): string | null {
  if (!url.startsWith(MEDIA_PREFIX)) return null
  const key = url.slice(MEDIA_PREFIX.length)
  // Defence in depth: keys we mint never contain traversal segments.
  if (!key || key.includes('..')) return null
  return key
}

/**
 * Sniff the real format from magic bytes instead of trusting the browser's
 * Content-Type. A mislabelled upload would otherwise be served back with a
 * content type that doesn't match its bytes.
 */
export function sniffImageType(bytes: Uint8Array): string | null {
  const b = bytes
  if (b.length < 12) return null
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  // RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp'
  // ....ftypavif
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
      b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66) return 'image/avif'
  return null
}
