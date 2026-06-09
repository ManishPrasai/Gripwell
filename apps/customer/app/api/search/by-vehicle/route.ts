import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const make    = searchParams.get('make')
    const model   = searchParams.get('model')
    const year    = searchParams.get('year')
    const variant = searchParams.get('variant')

    if (!make || !model || !year) {
      return NextResponse.json(
        { error: 'Make, model and year are required' },
        { status: 400 }
      )
    }

    const cacheKey = `search:vehicle:${make}:${model}:${year}:${variant}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Find the vehicle
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        make:    { equals: make,    mode: 'insensitive' },
        model:   { equals: model,   mode: 'insensitive' },
        year:    parseInt(year),
        variant: variant
          ? { equals: variant, mode: 'insensitive' }
          : undefined
      },
      include: {
        fitments: {
          include: {
            tyreSize: true
          }
        }
      }
    })

    if (!vehicle || vehicle.fitments.length === 0) {
      return NextResponse.json({
        tyres:   [],
        vehicle: null,
        message: `No fitment data found for ${year} ${make} ${model}`
      })
    }

    // Get all compatible tyre size IDs
    const tyreSizeIds = vehicle.fitments.map(f => f.tyreSizeId)

    // Find all tyres matching those sizes
    const tyres = await prisma.tyre.findMany({
      where: {
        tyreSizeId: { in: tyreSizeIds },
        isActive:   true,
        deletedAt:  null
      },
      orderBy: [
        { isBestSeller: 'desc' },
        { price: 'asc' }
      ],
      select: {
        id:             true,
        brand:          true,
        model:          true,
        type:           true,
        price:          true,
        compareAtPrice: true,
        stockQuantity:  true,
        isBestSeller:   true,
        isFeatured:     true,
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
      vehicle: {
        make:    vehicle.make,
        model:   vehicle.model,
        year:    vehicle.year,
        variant: vehicle.variant,
        fitments: vehicle.fitments.map(f => ({
          axlePosition:  f.axlePosition,
          isFactorySpec: f.isFactorySpec,
          tyreSize: {
            width:       f.tyreSize.width,
            profile:     f.tyreSize.profile,
            rimDiameter: f.tyreSize.rimDiameter,
            formatted:   `${f.tyreSize.width}/${f.tyreSize.profile}R${f.tyreSize.rimDiameter}`
          }
        }))
      },
      total: tyres.length
    }

    await setCache(cacheKey, response, TTL.SEARCH)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Search by vehicle error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}