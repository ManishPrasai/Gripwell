import { NextRequest, NextResponse } from 'next/server'
import { getTyreBySlug } from '../../../lib/product-queries'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const tyre = await getTyreBySlug(slug)
    if (!tyre) return NextResponse.json({ error: 'Tyre not found' }, { status: 404 })
    return NextResponse.json({ tyre })
  } catch (error) {
    console.error('Single tyre error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
