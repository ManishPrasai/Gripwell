import { NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

export async function GET() {
  try {
    const cacheKey = 'tyres:sizes:all'

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    const sizes = await prisma.tyreSize.findMany({
      select: { width: true, profile: true, rimDiameter: true }
    })

    const response = { sizes }
    await setCache(cacheKey, response, TTL.SEARCH)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Tyre sizes error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
