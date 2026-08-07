import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const brand     = searchParams.get('brand')
    const material  = searchParams.get('material')
    const finish    = searchParams.get('finish')
    const diameter  = searchParams.get('diameter')
    const width     = searchParams.get('width')
    const minPrice  = searchParams.get('minPrice')
    const maxPrice  = searchParams.get('maxPrice')
    const page      = parseInt(searchParams.get('page') || '1')
    const limit     = parseInt(searchParams.get('limit') || '12')
    const sortBy    = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const cacheKey = `wheels:list:${brand}:${material}:${finish}:${diameter}:${width}:${minPrice}:${maxPrice}:${page}:${limit}:${sortBy}:${sortOrder}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
      deletedAt: null
    }

    if (brand)    where.brand    = { equals: brand, mode: 'insensitive' }
    if (material) where.material = { equals: material, mode: 'insensitive' }
    if (finish)   where.finish   = { equals: finish, mode: 'insensitive' }
    if (diameter) where.diameter = parseInt(diameter)
    /* Rim width is a Decimal (e.g. 8.0) — parse as float, and ignore junk
       input rather than passing NaN into the query. */
    if (width && !Number.isNaN(parseFloat(width))) where.width = parseFloat(width)

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const orderBy: any = {}
    if (sortBy === 'price')     orderBy.price     = sortOrder
    if (sortBy === 'brand')     orderBy.brand     = sortOrder
    if (sortBy === 'createdAt') orderBy.createdAt = sortOrder

    const [wheels, total] = await Promise.all([
      prisma.wheel.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id:             true,
          brand:          true,
          model:          true,
          diameter:       true,
          width:          true,
          pcd:            true,
          offset:         true,
          material:       true,
          finish:         true,
          price:          true,
          compareAtPrice: true,
          stockQuantity:  true,
          slug:           true,
          images: {
            select: { url: true, altText: true },
            orderBy: { sortOrder: 'asc' },
            take: 1
          }
        }
      }),
      prisma.wheel.count({ where })
    ])

    const response = {
      wheels,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    }

    await setCache(cacheKey, response, TTL.WHEELS_LIST)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Wheels listing error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}