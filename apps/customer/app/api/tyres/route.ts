import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const brand     = searchParams.get('brand')
    const q         = searchParams.get('q')
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
    const cacheKey = `tyres:list:${brand}:${q}:${type}:${minPrice}:${maxPrice}:${width}:${profile}:${rim}:${page}:${limit}:${sortBy}:${sortOrder}`

    // Check cache first
    const cached = await getCache(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const skip = (page - 1) * limit

    const TYRE_SELECT = {
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
        orderBy: { sortOrder: 'asc' as const },
        take: 1
      }
    } as const

    // Free text: ranked by pg_trgm similarity (typo-tolerant — "sprot" still
    // finds "sport") with a plain substring OR so short/prefix queries still
    // hit even when their similarity score is too low. Not combined with the
    // other filters below — nothing in the app fires `q` alongside them.
    // Raw SQL is needed only for the ranking itself (Prisma's query builder
    // has no pg_trgm support); the actual row fetch still goes through the
    // normal, fully-typed Prisma path below.
    if (q) {
      // word_similarity (not similarity) — model names are multi-word
      // ("P Zero Sport"), and plain similarity() compares the WHOLE string,
      // so a typo in one word gets diluted against the rest and scores too
      // low. word_similarity finds the best match against any single word
      // within the longer string instead.
      const [ranked, countRows] = await Promise.all([
        prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Tyre"
          WHERE "isActive" = true AND "deletedAt" IS NULL
            AND (
              brand ILIKE '%' || ${q} || '%' OR model ILIKE '%' || ${q} || '%'
              OR word_similarity(${q}, brand) > 0.3 OR word_similarity(${q}, model) > 0.3
            )
          ORDER BY GREATEST(word_similarity(${q}, brand), word_similarity(${q}, model)) DESC
          LIMIT ${limit} OFFSET ${skip}
        `,
        prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM "Tyre"
          WHERE "isActive" = true AND "deletedAt" IS NULL
            AND (
              brand ILIKE '%' || ${q} || '%' OR model ILIKE '%' || ${q} || '%'
              OR word_similarity(${q}, brand) > 0.3 OR word_similarity(${q}, model) > 0.3
            )
        `,
      ])

      const orderedIds = ranked.map(r => r.id)
      const rows = orderedIds.length
        ? await prisma.tyre.findMany({ where: { id: { in: orderedIds } }, select: TYRE_SELECT })
        : []
      // findMany with `id: { in }` doesn't preserve array order — restore
      // the similarity ranking from the raw query.
      const byId = new Map(rows.map(r => [r.id, r]))
      const tyres = orderedIds.map(id => byId.get(id)).filter((t): t is typeof rows[number] => !!t)
      const total = Number(countRows[0]?.count ?? 0)

      const response = {
        tyres,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasMore: page * limit < total }
      }
      await setCache(cacheKey, response, TTL.TYRES_LIST)
      return NextResponse.json(response)
    }

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
      prisma.tyre.findMany({ where, orderBy, skip, take: limit, select: TYRE_SELECT }),
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