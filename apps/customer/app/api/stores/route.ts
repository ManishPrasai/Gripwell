import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const cacheKey = 'stores:all'

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
        deletedAt: null
      },
      orderBy: { name: 'asc' },
      select: {
        id:        true,
        name:      true,
        slug:      true,
        address:   true,
        suburb:    true,
        state:     true,
        postcode:  true,
        latitude:  true,
        longitude: true,
        phone:     true,
        email:     true,
        hours: {
          select: {
            dayOfWeek: true,
            openTime:  true,
            closeTime: true,
            isClosed:  true
          },
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    })

    const response = { stores }
    await setCache(cacheKey, response, TTL.STORES)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Stores listing error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}