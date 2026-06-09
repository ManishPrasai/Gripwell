import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const cacheKey = `wheels:single:${slug}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const wheel = await prisma.wheel.findUnique({
      where: {
        slug,
        isActive: true,
        deletedAt: null
      },
      select: {
        id:             true,
        brand:          true,
        model:          true,
        description:    true,
        diameter:       true,
        width:          true,
        pcd:            true,
        offset:         true,
        bore:           true,
        material:       true,
        finish:         true,
        price:          true,
        compareAtPrice: true,
        stockQuantity:  true,
        slug:           true,
        images: {
          select: {
            url:       true,
            altText:   true,
            sortOrder: true
          },
          orderBy: { sortOrder: 'asc' }
        },
        packages: {
          where: { isActive: true },
          select: {
            id:           true,
            name:         true,
            packagePrice: true,
            tyre: {
              select: {
                brand: true,
                model: true,
                slug:  true,
                tyreSize: {
                  select: {
                    width:       true,
                    profile:     true,
                    rimDiameter: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!wheel) {
      return NextResponse.json(
        { error: 'Wheel not found' },
        { status: 404 }
      )
    }

    const response = { wheel }
    await setCache(cacheKey, response, TTL.WHEEL_SINGLE)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Single wheel error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}