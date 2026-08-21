/**
 * POST /api/admin/media — upload a product image, get back a public URL.
 *
 * Deliberately decoupled from any product: the manual "add product" form needs
 * a URL *before* the product row exists, and CSV import wants to reference
 * already-uploaded images. So this stores bytes and returns a path; attaching
 * that path to a Tyre/Wheel is a separate call (`products/[id]/images`).
 *
 * Orphan uploads (image stored, product never saved) are harmless — a few KB in
 * KV with no DB row pointing at them.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  requireAdmin, assertSuperAdmin, AdminError,
} from '../../../../lib/mutation'
import {
  mediaKV, extensionFor, newMediaKey, keyToUrl, sniffImageType, MAX_UPLOAD_BYTES,
} from '../../../../lib/media'

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    // The catalog is shared across every store, so is its imagery.
    assertSuperAdmin(admin)

    const kv = mediaKV()
    if (!kv) {
      return NextResponse.json(
        { error: 'Image storage is not available in this environment' },
        { status: 503 },
      )
    }

    const form = await req.formData().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image file was uploaded' }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'That file is empty' }, { status: 400 })
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Image is too large — keep it under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB` },
        { status: 413 },
      )
    }

    const bytes = new Uint8Array(await file.arrayBuffer())

    // Trust the bytes, not the browser-supplied Content-Type.
    const contentType = sniffImageType(bytes)
    if (!contentType) {
      return NextResponse.json(
        { error: 'That file is not a supported image (use JPEG, PNG, WebP or AVIF)' },
        { status: 415 },
      )
    }
    const ext = extensionFor(contentType)
    if (!ext) {
      return NextResponse.json({ error: 'Unsupported image format' }, { status: 415 })
    }

    const key = newMediaKey(ext)
    await kv.put(key, bytes, {
      metadata: { contentType, size: bytes.byteLength, uploadedBy: admin.id },
    })

    return NextResponse.json({
      success: true,
      data: { url: keyToUrl(key), key, contentType, size: bytes.byteLength },
    })
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[admin/media] upload error:', e)
    return NextResponse.json({ error: 'Upload failed — please try again' }, { status: 500 })
  }
}
