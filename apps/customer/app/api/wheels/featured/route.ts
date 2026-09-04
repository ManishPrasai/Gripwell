import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    // No cap by default — an admin can feature as many products as they like
    // and every one of them shows; the grid wraps to more rows on its own.
    // `limit` stays supported for any caller that does want a capped preview.
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : undefined

    const cacheKey = `wheels:featured:${limit ?? 'all'}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const wheels = await prisma.wheel.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        deletedAt: null
      },
      ...(limit ? { take: limit } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id:             true,
        brand:          true,
        model:          true,
        price:          true,
        compareAtPrice: true,
        stockQuantity:  true,
        isFeatured:     true,
        slug:           true,
        diameter:       true,
        width:          true,
        pcd:            true,
        images: {
          select: { url: true, altText: true },
          orderBy: { sortOrder: 'asc' },
          take: 1
        }
      }
    })

    const response = { wheels }
    await setCache(cacheKey, response, TTL.FEATURED)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Featured wheels error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
