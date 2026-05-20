import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    const cacheKey = `tyres:bestsellers:${limit}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const tyres = await prisma.tyre.findMany({
      where: {
        isActive: true,
        isBestSeller: true,
        deletedAt: null
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:             true,
        brand:          true,
        model:          true,
        type:           true,
        price:          true,
        compareAtPrice: true,
        stockQuantity:  true,
        isBestSeller:   true,
        slug:           true,
        tyreSize: {
          select: {
            width:       true,
            profile:     true,
            rimDiameter: true,
            speedRating: true
          }
        },
        images: {
          select: { url: true, altText: true },
          orderBy: { sortOrder: 'asc' },
          take: 1
        }
      }
    })

    const response = { tyres }
    await setCache(cacheKey, response, TTL.BESTSELLERS)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Best sellers error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}