import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const cacheKey = `tyres:single:${slug}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const tyre = await prisma.tyre.findUnique({
      where: {
        slug,
        isActive: true,
        deletedAt: null
      },
      select: {
        id:                   true,
        brand:                true,
        model:                true,
        description:          true,
        type:                 true,
        price:                true,
        compareAtPrice:       true,
        stockQuantity:        true,
        isBestSeller:         true,
        isFeatured:           true,
        fuelEfficiencyRating: true,
        wetGripRating:        true,
        noiseLevelDb:         true,
        slug:                 true,
        createdAt:            true,
        tyreSize: {
          select: {
            width:        true,
            profile:      true,
            rimDiameter:  true,
            loadIndex:    true,
            speedRating:  true,
            construction: true
          }
        },
        images: {
          select: {
            url:       true,
            altText:   true,
            sortOrder: true
          },
          orderBy: { sortOrder: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          select: {
            id:        true,
            rating:    true,
            title:     true,
            body:      true,
            createdAt: true,
            customer: {
              select: {
                firstName: true,
                lastName:  true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!tyre) {
      return NextResponse.json(
        { error: 'Tyre not found' },
        { status: 404 }
      )
    }

    const response = { tyre }
    await setCache(cacheKey, response, TTL.TYRE_SINGLE)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Single tyre error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}