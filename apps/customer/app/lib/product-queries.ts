import { prisma, getCache, setCache, TTL } from '@nova/database'

/* ────────────────────────────────────────────────────────────────────────────
   Direct DB access for the product pages.

   The product pages are React Server Components and must query the database
   *directly* — never by fetching their own `/api/...` HTTP route. On Cloudflare
   the Worker cannot reach `http://localhost:3000`, so a self-fetch silently
   fell back to demo data (every tyre page rendered the Citadel demo). The
   same functions back the `/api/tyres|wheels/[slug]` routes, so there is one
   source of truth.
   ──────────────────────────────────────────────────────────────────────────── */

export interface SimilarItem {
  brand: string
  sub: string
  price: number
  slug: string
  image: string
}

/* JSON round-trip so Prisma Decimal → string and Date → ISO string, matching
   exactly what the components already expect (they parseFloat the prices). */
const serialize = <T>(v: T): T => JSON.parse(JSON.stringify(v))

/* ── Single tyre ──────────────────────────────────────────────────────────── */
// Returns the serialized product shape (Decimals as strings); `any` because the
// consuming component owns the concrete type, matching the old res.json() flow.
export async function getTyreBySlug(slug: string): Promise<any> {
  const cacheKey = `pdp:tyre:${slug}`
  const cached = await getCache<any>(cacheKey)
  if (cached) return cached

  const tyre = await prisma.tyre.findUnique({
    where: { slug, isActive: true, deletedAt: null },
    select: {
      id: true, brand: true, model: true, description: true, type: true,
      price: true, compareAtPrice: true, stockQuantity: true,
      isBestSeller: true, isFeatured: true,
      fuelEfficiencyRating: true, wetGripRating: true, noiseLevelDb: true,
      slug: true, createdAt: true,
      tyreSize: { select: { width: true, profile: true, rimDiameter: true, loadIndex: true, speedRating: true, construction: true } },
      images: { select: { url: true, altText: true, sortOrder: true }, orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { isApproved: true },
        select: { id: true, rating: true, title: true, body: true, createdAt: true, customer: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!tyre) return null
  const data = serialize(tyre)
  await setCache(cacheKey, data, TTL.TYRE_SINGLE)
  return data
}

/* ── Single wheel ─────────────────────────────────────────────────────────── */
export async function getWheelBySlug(slug: string): Promise<any> {
  const cacheKey = `pdp:wheel:${slug}`
  const cached = await getCache<any>(cacheKey)
  if (cached) return cached

  const wheel = await prisma.wheel.findUnique({
    where: { slug, isActive: true, deletedAt: null },
    select: {
      id: true, brand: true, model: true, description: true,
      diameter: true, width: true, pcd: true, offset: true, bore: true,
      material: true, finish: true, price: true, compareAtPrice: true, stockQuantity: true, slug: true,
      images: { select: { url: true, altText: true, sortOrder: true }, orderBy: { sortOrder: 'asc' } },
      packages: {
        where: { isActive: true },
        select: {
          id: true, name: true, packagePrice: true,
          tyre: { select: { brand: true, model: true, slug: true, tyreSize: { select: { width: true, profile: true, rimDiameter: true } } } },
        },
      },
    },
  })

  if (!wheel) return null
  const data = serialize(wheel)
  await setCache(cacheKey, data, TTL.WHEEL_SINGLE)
  return data
}

/* ── All active slugs (sitemap) ───────────────────────────────────────────── */
export async function getAllTyreSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.tyre.findMany({
    where: { isActive: true, deletedAt: null },
    select: { slug: true, updatedAt: true },
  })
}

export async function getAllWheelSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.wheel.findMany({
    where: { isActive: true, deletedAt: null },
    select: { slug: true, updatedAt: true },
  })
}

/* ── Similar tyres (fitment-aware) ────────────────────────────────────────── */
const TYRE_CARD = {
  brand: true, model: true, type: true, price: true, slug: true, isBestSeller: true,
  tyreSize: { select: { width: true, profile: true, rimDiameter: true, loadIndex: true, speedRating: true } },
  images: { select: { url: true, altText: true }, orderBy: { sortOrder: 'asc' as const }, take: 1 },
} as const

export async function getSimilarTyres(slug: string): Promise<SimilarItem[]> {
  try {
    const cacheKey = `pdp:tyre-sim:${slug}`
    const cached = await getCache<SimilarItem[]>(cacheKey)
    if (cached) return cached

    const current = await prisma.tyre.findUnique({
      where: { slug, isActive: true, deletedAt: null },
      select: { brand: true, type: true, price: true, tyreSize: { select: { width: true, profile: true, rimDiameter: true } } },
    })
    if (!current) return []

    const rim = current.tyreSize.rimDiameter
    const seen = new Set<string>([slug])
    const pool: any[] = []
    async function add(where: object, take: number) {
      if (pool.length >= 12) return
      const rows = await prisma.tyre.findMany({ where: { isActive: true, deletedAt: null, slug: { notIn: [...seen] }, ...where }, take, select: TYRE_CARD })
      for (const r of rows as any[]) { pool.push(r); seen.add(r.slug) }
    }
    await add({ tyreSize: { rimDiameter: rim }, type: current.type }, 12)
    await add({ tyreSize: { rimDiameter: rim } }, 12)
    await add({ type: current.type }, 8)
    await add({}, 8)

    const basePrice = Number(current.price)
    const scored = pool.map(t => {
      let score = 0
      if (t.tyreSize.rimDiameter === rim) score += 100
      if (t.type === current.type) score += 40
      if (t.tyreSize.width === current.tyreSize.width) score += 15
      if (t.tyreSize.profile === current.tyreSize.profile) score += 15
      if (t.brand === current.brand) score += 10
      score += Math.max(0, 20 - (Math.abs(Number(t.price) - basePrice) / Math.max(basePrice, 1)) * 20)
      if (t.isBestSeller) score += 4
      return { t, score }
    }).sort((a, b) => b.score - a.score)

    const items: SimilarItem[] = scored.slice(0, 4).map(({ t }) => {
      const ts = t.tyreSize
      const sub = [t.model, `${ts.width}/${ts.profile}R${ts.rimDiameter}`, `${ts.loadIndex ?? ''}${ts.speedRating ?? ''}`].filter(Boolean).join(' · ')
      return { brand: t.brand, sub, price: Number(t.price), slug: t.slug, image: t.images[0]?.url ?? '/images/tyres/tyre-passenger.png' }
    })
    await setCache(cacheKey, items, TTL.TYRES_LIST)
    return items
  } catch (e) {
    console.error('getSimilarTyres error:', e)
    return []
  }
}

/* ── Similar wheels (fitment-aware) ───────────────────────────────────────── */
const WHEEL_CARD = {
  brand: true, model: true, diameter: true, width: true, pcd: true, material: true, finish: true, price: true, slug: true,
  images: { select: { url: true, altText: true }, orderBy: { sortOrder: 'asc' as const }, take: 1 },
} as const

export async function getSimilarWheels(slug: string): Promise<SimilarItem[]> {
  try {
    const cacheKey = `pdp:wheel-sim:${slug}`
    const cached = await getCache<SimilarItem[]>(cacheKey)
    if (cached) return cached

    const current = await prisma.wheel.findUnique({
      where: { slug, isActive: true, deletedAt: null },
      select: { brand: true, diameter: true, pcd: true, material: true, finish: true, price: true },
    })
    if (!current) return []

    const seen = new Set<string>([slug])
    const pool: any[] = []
    async function add(where: object, take: number) {
      if (pool.length >= 12) return
      const rows = await prisma.wheel.findMany({ where: { isActive: true, deletedAt: null, slug: { notIn: [...seen] }, ...where }, take, select: WHEEL_CARD })
      for (const r of rows as any[]) { pool.push(r); seen.add(r.slug) }
    }
    await add({ diameter: current.diameter, pcd: current.pcd }, 12)
    await add({ diameter: current.diameter }, 12)
    await add({ pcd: current.pcd }, 8)
    await add({}, 8)

    const basePrice = Number(current.price)
    const scored = pool.map(w => {
      let score = 0
      if (w.diameter === current.diameter) score += 100
      if (w.pcd === current.pcd) score += 80
      if (w.material === current.material) score += 15
      if (w.finish === current.finish) score += 15
      if (w.brand === current.brand) score += 10
      score += Math.max(0, 20 - (Math.abs(Number(w.price) - basePrice) / Math.max(basePrice, 1)) * 20)
      return { w, score }
    }).sort((a, b) => b.score - a.score)

    const items: SimilarItem[] = scored.slice(0, 4).map(({ w }) => ({
      brand: w.brand,
      sub: `${w.model} · ${w.diameter}×${Number(w.width)} · ${w.pcd}`,
      price: Number(w.price),
      slug: w.slug,
      image: w.images[0]?.url ?? '/images/wheel/Wheel 1.png',
    }))
    await setCache(cacheKey, items, TTL.WHEELS_LIST)
    return items
  } catch (e) {
    console.error('getSimilarWheels error:', e)
    return []
  }
}
