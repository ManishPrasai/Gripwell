/**
 * POST /api/warranty/claim
 *
 * Real submission path for the Warranty & Refund Policy page's claim form —
 * not a UI-only mockup. The claim is stored as an `Enquiry` row (the same
 * model the admin dashboard's live enquiries feed already queries, with
 * `type` set to 'warranty' or 'refund' so it's distinguishable there), and
 * two emails go out: a confirmation to the customer and a notice to staff.
 *
 * Files (receipt + fault photos) are written straight to MEDIA_DIR, the same
 * shared disk volume `apps/customer/app/media/[...key]/route.ts` already
 * serves from — so a stored path just works with no new serving route.
 */
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { prisma } from '@nova/database'
import { sendWarrantyClaimConfirmation, sendWarrantyClaimNotification } from '../../../../lib/email'

const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), '.media')
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const IMAGE_EXT_BY_SIG: Record<string, string> = { png: 'png', jpg: 'jpg', webp: 'webp' }

/** Trusts magic bytes, not the browser-supplied Content-Type. Images only,
 *  plus PDF for the receipt slot (bank statements/invoices are often PDFs). */
function sniff(bytes: Uint8Array, allowPdf: boolean): string | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return IMAGE_EXT_BY_SIG.png
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return IMAGE_EXT_BY_SIG.jpg
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return IMAGE_EXT_BY_SIG.webp
  if (allowPdf && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf'
  return null
}

async function storeFile(file: File, allowPdf: boolean): Promise<{ url: string } | { error: string }> {
  if (file.size === 0) return { error: 'One of the uploaded files is empty' }
  if (file.size > MAX_UPLOAD_BYTES) return { error: 'Files must be under 8MB each' }
  const bytes = new Uint8Array(await file.arrayBuffer())
  const ext = sniff(bytes, allowPdf)
  if (!ext) return { error: allowPdf ? 'Receipt must be a JPG, PNG, WebP or PDF' : 'Photos must be JPG, PNG or WebP' }
  const key = `warranty-claims/${crypto.randomUUID()}.${ext}`
  const filePath = path.join(MEDIA_DIR, key)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, bytes)
  return { url: `/media/${key}` }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData().catch(() => null)
    if (!form) return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 })

    const claimType: 'warranty' | 'refund' = form.get('claimType') === 'refund' ? 'refund' : 'warranty'
    const name        = String(form.get('name') || '').trim()
    const email       = String(form.get('email') || '').trim().toLowerCase()
    const phone       = String(form.get('phone') || '').trim()
    const address     = String(form.get('address') || '').trim()
    const orderNumber = String(form.get('orderNumber') || '').trim()
    const productName = String(form.get('productName') || '').trim()
    const tyreCount   = String(form.get('tyreCount') || '').trim()
    const reason      = String(form.get('reason') || '').trim()

    if (!name || !phone || !address || !productName || !reason) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
    }

    const receipt = form.get('receipt')
    if (!(receipt instanceof File) || receipt.size === 0) {
      return NextResponse.json({ error: 'Please attach your receipt or proof of purchase' }, { status: 400 })
    }
    const receiptResult = await storeFile(receipt, true)
    if ('error' in receiptResult) return NextResponse.json({ error: receiptResult.error }, { status: 415 })

    const photoFiles = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0)
    const photoUrls: string[] = []
    for (const f of photoFiles) {
      const result = await storeFile(f, false)
      if ('error' in result) return NextResponse.json({ error: result.error }, { status: 415 })
      photoUrls.push(result.url)
    }

    const message = [
      `Product: ${productName}`,
      orderNumber ? `Order number: ${orderNumber}` : null,
      tyreCount ? `Tyres affected: ${tyreCount}` : null,
      `Address: ${address}`,
      `Reason: ${reason}`,
      `Receipt: ${receiptResult.url}`,
      photoUrls.length ? `Photos: ${photoUrls.join(', ')}` : null,
    ].filter(Boolean).join('\n')

    await prisma.enquiry.create({
      data: { name, phone, email, message, type: claimType, status: 'NEW' },
    })

    const claimData = {
      claimType, name, email, phone, address, orderNumber, productName, tyreCount, reason,
      receiptUrl: receiptResult.url, photoUrls,
    }
    await Promise.all([
      sendWarrantyClaimConfirmation(claimData),
      sendWarrantyClaimNotification(claimData),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[warranty/claim] error:', error)
    return NextResponse.json({ error: 'Something went wrong — please try again' }, { status: 500 })
  }
}
