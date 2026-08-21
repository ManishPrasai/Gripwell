import { NextRequest, NextResponse } from 'next/server'
import { getWheelBySlug } from '../../../lib/product-queries'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const wheel = await getWheelBySlug(slug)
    if (!wheel) return NextResponse.json({ error: 'Wheel not found' }, { status: 404 })
    return NextResponse.json({ wheel })
  } catch (error) {
    console.error('Single wheel error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
