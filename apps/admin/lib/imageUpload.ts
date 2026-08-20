/**
 * Browser-side image prep + upload.
 *
 * Product photos come off phones and supplier sites at 4–12MB, which is wasteful
 * to store and slow to load on the storefront. We downscale to a sane maximum
 * and re-encode as WebP before the bytes ever leave the browser, so a typical
 * upload lands at 50–250KB. The server still validates independently.
 *
 * Browser-only — import from client components.
 */

/** Longest edge of a stored product image, in pixels. */
const MAX_EDGE = 1600
const WEBP_QUALITY = 0.86

export interface UploadedImage {
  url:  string
  size: number
}

const isImage = (f: File) => f.type.startsWith('image/') || /\.(png|jpe?g|webp|avif)$/i.test(f.name)

/**
 * Downscale + re-encode. Returns the original file untouched if anything about
 * the canvas path fails (or if the image is already small) — an unoptimised
 * upload is much better than a failed one.
 */
async function prepare(file: File): Promise<Blob> {
  try {
    // `from-image` applies EXIF orientation, so phone photos aren't rotated.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const { width, height } = bitmap

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
    // Already small and already a compact format — nothing to gain.
    if (scale === 1 && (file.type === 'image/webp' || file.type === 'image/avif')) {
      bitmap.close()
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width  = Math.round(width * scale)
    canvas.height = Math.round(height * scale)

    const ctx = canvas.getContext('2d')
    if (!ctx) { bitmap.close(); return file }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
    )
    // Keep whichever is smaller — re-encoding a small PNG can inflate it.
    if (!blob || blob.size >= file.size) return file
    return blob
  } catch {
    return file
  }
}

/** Prepare a file and upload it. Resolves to the public `/media/...` URL. */
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  if (!isImage(file)) {
    throw new Error('That file is not an image — use JPEG, PNG or WebP')
  }

  const blob = await prepare(file)
  const ext  = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg')

  const form = new FormData()
  form.append('file', blob, `upload.${ext}`)

  const res = await fetch('/api/admin/media', { method: 'POST', body: form })

  let json: any = null
  try { json = await res.json() } catch { /* non-JSON error body */ }

  if (!res.ok) throw new Error(json?.error || `Upload failed (${res.status})`)

  const url = json?.data?.url
  if (!url) throw new Error('Upload succeeded but no image URL came back')

  return { url, size: json?.data?.size ?? blob.size }
}
