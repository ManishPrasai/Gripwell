import { NextRequest, NextResponse } from 'next/server'
import { getSimilarWheels } from '../../../../lib/product-queries'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const wheels = await getSimilarWheels(slug)
  return NextResponse.json({ wheels })
}
