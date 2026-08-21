import { NextRequest, NextResponse } from 'next/server'
import { getSimilarTyres } from '../../../../lib/product-queries'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const tyres = await getSimilarTyres(slug)
  return NextResponse.json({ tyres })
}
