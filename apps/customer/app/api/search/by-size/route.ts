import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const width   = searchParams.get('width')
    const profile = searchParams.get('profile')
    const rim     = searchParams.get('rim')

    if (!width || !profile || !rim) {
      return NextResponse.json(
        { error: 'Width, profile and rim diameter are required' },
        { status: 400 }
      )
    }

    const cacheKey = `search:size:${width}:${profile}:${rim}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Find matching tyre size
    const tyreSize = await prisma.tyreSize.findUnique({
      where: {
        width_profile_rimDiameter: {
          width:       parseInt(width),
          profile:     parseInt(profile),
          rimDiameter: parseInt(rim)
        }
      }
    })

    if (!tyreSize) {
      return NextResponse.json({
        tyres: [],
        tyreSize: null,
        message: `No tyres found for size ${width}/${profile}R${rim}`
      })
    }

    // Find all tyres matching this size
    const tyres = await prisma.tyre.findMany({
      where: {
        tyreSizeId: tyreSize.id,
        isActive:   true,
        deletedAt:  null
      },
      orderBy: { price: 'asc' },
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
        fuelEfficiencyRating: true,
        wetGripRating:  true,
        tyreSize: {
          select: {
            width:       true,
            profile:     true,
            rimDiameter: true,
            loadIndex:   true,
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

    const response = {
      tyres,
      tyreSize: {
        width:       tyreSize.width,
        profile:     tyreSize.profile,
        rimDiameter: tyreSize.rimDiameter,
        formatted:   `${tyreSize.width}/${tyreSize.profile}R${tyreSize.rimDiameter}`
      },
      total: tyres.length
    }

    await setCache(cacheKey, response, TTL.SEARCH)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Search by size error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}