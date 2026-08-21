/**
 * Product image storage — Workers KV.
 *
 * Images live in the `NOVA_MEDIA` KV namespace, bound to both Workers: the
 * admin writes on upload, the storefront reads when serving `/media/*`. KV is
 * the right fit here — product photos are written rarely and read constantly,
 * and every edge location caches them.
 *
 * Stored URLs are *relative* (`/media/products/<uuid>.webp`) on purpose. The
 * same string resolves on the admin domain and on the storefront, because both
 * Workers serve that route from the same namespace. No custom domain, no CORS,
 * no absolute URL to rewrite if the domain ever changes.
 */
import { getCloudflareContext } from '@opennextjs/cloudflare'

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
 * Minimal structural type for the KV binding. `@cloudflare/workers-types` isn't
 * a dependency of this repo (bindings are reached through `env as any`
 * elsewhere too), and these three calls are everything media storage needs.
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

/**
 * The KV binding, or null when it isn't available (plain `next dev` without the
 * Cloudflare dev proxy). Callers surface a clear message rather than crashing.
 */
export function mediaKV(): MediaKV | null {
  try {
    const env = getCloudflareContext().env as unknown as Record<string, MediaKV | undefined>
    return env?.NOVA_MEDIA ?? null
  } catch {
    // Not inside a Cloudflare request context.
    return null
  }
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
