import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const brand     = searchParams.get('brand')
    const type      = searchParams.get('type')
    const minPrice  = searchParams.get('minPrice')
    const maxPrice  = searchParams.get('maxPrice')
    const width     = searchParams.get('width')
    const profile   = searchParams.get('profile')
    const rim       = searchParams.get('rim')
    const page      = parseInt(searchParams.get('page') || '1')
    const limit     = parseInt(searchParams.get('limit') || '12')
    const sortBy    = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build cache key from all params
    const cacheKey = `tyres:list:${brand}:${type}:${minPrice}:${maxPrice}:${width}:${profile}:${rim}:${page}:${limit}:${sortBy}:${sortOrder}`

    // Check cache first
    const cached = await getCache(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
      deletedAt: null
    }

    if (brand) where.brand = { equals: brand, mode: 'insensitive' }
    if (type)  where.type  = type

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (width || profile || rim) {
      where.tyreSize = {}
      if (width)   where.tyreSize.width       = parseInt(width)
      if (profile) where.tyreSize.profile     = parseInt(profile)
      if (rim)     where.tyreSize.rimDiameter = parseInt(rim)
    }

    const orderBy: any = {}
    if (sortBy === 'price')     orderBy.price     = sortOrder
    if (sortBy === 'brand')     orderBy.brand     = sortOrder
    if (sortBy === 'createdAt') orderBy.createdAt = sortOrder

    const [tyres, total] = await Promise.all([
      prisma.tyre.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.tyre.count({ where })
    ])

    const response = {
      tyres,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    }

    // Store in cache
    await setCache(cacheKey, response, TTL.TYRES_LIST)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Tyres listing error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}