import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache } from '@nova/database'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat     = parseFloat(searchParams.get('lat') || '0')
    const lng     = parseFloat(searchParams.get('lng') || '0')
    const suburb  = searchParams.get('suburb')
    const limit   = parseInt(searchParams.get('limit') || '2')

    if (!lat && !lng && !suburb) {
      return NextResponse.json(
        { error: 'Please provide lat/lng or suburb' },
        { status: 400 }
      )
    }

    const cacheKey = `stores:nearest:${lat}:${lng}:${suburb}:${limit}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    // Get all active stores
    const stores = await prisma.store.findMany({
      where: {
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
        }
      }
    })

    let nearestStores = stores

    // If lat/lng provided calculate distance
    if (lat && lng) {
      const storesWithDistance = stores.map(store => {
        const storeLat = parseFloat(store.latitude.toString())
        const storeLng = parseFloat(store.longitude.toString())

        // Haversine formula for distance in km
        const R = 6371
        const dLat = (storeLat - lat) * Math.PI / 180
        const dLng = (storeLng - lng) * Math.PI / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat * Math.PI / 180) *
          Math.cos(storeLat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        return { ...store, distance: Math.round(distance * 10) / 10 }
      })

      nearestStores = storesWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
    }

    // If suburb provided filter by suburb or state
    if (suburb && !lat) {
      nearestStores = stores
        .filter(store =>
          store.suburb.toLowerCase().includes(suburb.toLowerCase()) ||
          store.state.toLowerCase().includes(suburb.toLowerCase())
        )
        .slice(0, limit)
    }

    const response = { stores: nearestStores }
    await setCache(cacheKey, response, 60 * 5) // 5 min cache

    return NextResponse.json(response)

  } catch (error) {
    console.error('Nearest store error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}