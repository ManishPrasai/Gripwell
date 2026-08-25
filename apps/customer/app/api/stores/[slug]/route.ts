import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const cacheKey = `stores:single:${slug}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const store = await prisma.store.findUnique({
      where: {
        slug,
        isActive: true,
        deletedAt: null
      },
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
          }
        },
        storeServices: {
          select: {
            isAvailable: true,
            service: {
              select: {
                id:              true,
                name:            true,
                description:     true,
                priceFrom:       true,
                durationMinutes: true
              }
            }
          },
          where: { isAvailable: true }
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    const response = { store }
    await setCache(cacheKey, response, TTL.STORES)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Single store error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}