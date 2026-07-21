import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

/* Fields we need to render a "similar wheel" card + score relevance. */
const CARD_SELECT = {
  brand:    true,
  model:    true,
  diameter: true,
  width:    true,
  pcd:      true,
  material: true,
  finish:   true,
  price:    true,
  slug:     true,
  images: {
    select: { url: true, altText: true },
    orderBy: { sortOrder: 'asc' as const },
    take: 1,
  },
} as const

type Candidate = {
  brand: string; model: string; diameter: number; width: unknown; pcd: string
  material: string; finish: string | null; price: unknown; slug: string
  images: { url: string; altText: string | null }[]
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const cacheKey = `wheels:similar:${slug}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    /* The wheel we're matching against. */
    const current = await prisma.wheel.findUnique({
      where: { slug, isActive: true, deletedAt: null },
      select: { brand: true, diameter: true, pcd: true, material: true, finish: true, price: true },
    })

    if (!current) return NextResponse.json({ wheels: [] })

    /* Candidate pool, strongest fitment signal first. Bolt pattern (pcd) + rim
       diameter decide whether a wheel physically fits the same vehicle, so those
       lead; then anything active backfills to always fill the row of four. */
    const seen = new Set<string>([slug])
    const pool: Candidate[] = []

    async function add(where: object, take: number) {
      if (pool.length >= 12) return
      const rows = await prisma.wheel.findMany({
        where: { isActive: true, deletedAt: null, slug: { notIn: [...seen] }, ...where },
        take,
        select: CARD_SELECT,
      }) as unknown as Candidate[]
      for (const r of rows) { pool.push(r); seen.add(r.slug) }
    }

    await add({ diameter: current.diameter, pcd: current.pcd }, 12) // same fitment (rim + bolt pattern)
    await add({ diameter: current.diameter }, 12)                   // same rim diameter
    await add({ pcd: current.pcd }, 8)                              // same bolt pattern
    await add({}, 8)                                                // backfill: anything active

    const basePrice = Number(current.price)

    const scored = pool.map(w => {
      let score = 0
      if (w.diameter === current.diameter) score += 100 // same rim size
      if (w.pcd === current.pcd)           score += 80  // same bolt pattern (fitment-critical)
      if (w.material === current.material) score += 15
      if (w.finish === current.finish)     score += 15
      if (w.brand === current.brand)       score += 10
      const diff = Math.abs(Number(w.price) - basePrice)
      score += Math.max(0, 20 - (diff / Math.max(basePrice, 1)) * 20)
      return { w, score }
    })

    scored.sort((a, b) => b.score - a.score)

    const wheels = scored.slice(0, 4).map(({ w }) => {
      const sub = `${w.model} · ${w.diameter}×${Number(w.width)} · ${w.pcd}`
      return {
        brand: w.brand,
        sub,
        price: Number(w.price),
        slug:  w.slug,
        image: w.images[0]?.url ?? '/images/wheel/Wheel 1.png',
      }
    })

    const response = { wheels }
    await setCache(cacheKey, response, TTL.WHEELS_LIST)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Similar wheels error:', error)
    return NextResponse.json({ wheels: [] })
  }
}
