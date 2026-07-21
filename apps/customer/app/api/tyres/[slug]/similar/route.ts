import { NextRequest, NextResponse } from 'next/server'
import { prisma, getCache, setCache, TTL } from '@nova/database'

/* Fields we need to render a "similar tyre" card + score relevance. */
const CARD_SELECT = {
  brand:  true,
  model:  true,
  type:   true,
  price:  true,
  slug:   true,
  isBestSeller: true,
  tyreSize: {
    select: { width: true, profile: true, rimDiameter: true, loadIndex: true, speedRating: true },
  },
  images: {
    select: { url: true, altText: true },
    orderBy: { sortOrder: 'asc' as const },
    take: 1,
  },
} as const

type Candidate = {
  brand: string; model: string; type: string; price: unknown; slug: string; isBestSeller: boolean
  tyreSize: { width: number; profile: number; rimDiameter: number; loadIndex: number | null; speedRating: string | null }
  images: { url: string; altText: string | null }[]
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const cacheKey = `tyres:similar:${slug}`

    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json(cached)

    /* The tyre we're matching against. */
    const current = await prisma.tyre.findUnique({
      where: { slug, isActive: true, deletedAt: null },
      select: {
        brand: true, type: true, price: true,
        tyreSize: { select: { width: true, profile: true, rimDiameter: true } },
      },
    })

    if (!current) return NextResponse.json({ tyres: [] })

    /* Build a candidate pool, strongest fitment signal first, so the result is
       genuinely "similar" rather than random — same rim diameter fits the same
       wheels, then same tyre category, then anything as a last-resort backfill. */
    const rim  = current.tyreSize.rimDiameter
    const seen = new Set<string>([slug])
    const pool: Candidate[] = []

    async function add(where: object, take: number) {
      if (pool.length >= 12) return
      const rows = await prisma.tyre.findMany({
        where: { isActive: true, deletedAt: null, slug: { notIn: [...seen] }, ...where },
        take,
        select: CARD_SELECT,
      }) as unknown as Candidate[]
      for (const r of rows) { pool.push(r); seen.add(r.slug) }
    }

    await add({ tyreSize: { rimDiameter: rim }, type: current.type }, 12) // same rim + same category
    await add({ tyreSize: { rimDiameter: rim } }, 12)                     // same rim, any category
    await add({ type: current.type }, 8)                                 // same category, any rim
    await add({}, 8)                                                     // backfill: anything active

    const basePrice = Number(current.price)

    const scored = pool.map(t => {
      let score = 0
      if (t.tyreSize.rimDiameter === rim)                    score += 100 // fits the same wheels
      if (t.type === current.type)                           score += 40
      if (t.tyreSize.width === current.tyreSize.width)       score += 15
      if (t.tyreSize.profile === current.tyreSize.profile)   score += 15
      if (t.brand === current.brand)                         score += 10
      // price proximity: up to +20 as prices converge
      const diff = Math.abs(Number(t.price) - basePrice)
      score += Math.max(0, 20 - (diff / Math.max(basePrice, 1)) * 20)
      if (t.isBestSeller)                                    score += 4
      return { t, score }
    })

    scored.sort((a, b) => b.score - a.score)

    const tyres = scored.slice(0, 4).map(({ t }) => {
      const ts   = t.tyreSize
      const size = `${ts.width}/${ts.profile}R${ts.rimDiameter}`
      const ls   = `${ts.loadIndex ?? ''}${ts.speedRating ?? ''}`
      const sub  = [t.model, size, ls].filter(Boolean).join(' · ')
      return {
        brand: t.brand,
        sub,
        price: Number(t.price),
        slug:  t.slug,
        image: t.images[0]?.url ?? '/images/tyres/Tyre 1.png',
      }
    })

    const response = { tyres }
    await setCache(cacheKey, response, TTL.TYRES_LIST)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Similar tyres error:', error)
    return NextResponse.json({ tyres: [] })
  }
}
