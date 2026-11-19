import { prisma } from '@nova/database'

/* ── Catalogue reads for the home search and the fitted results ───────── */

export const sizeKey   = (w: number, p: number, r: number) => `${w}/${p}R${r}`
export const sizeLabel = (w: number, p: number, r: number) => `${w}/${p} R${r}`

const inStock = { isActive: true, deletedAt: null, stockQuantity: { gt: 0 } } as const

export interface StockedSize { key: string; width: number; profile: number; rim: number; from: number; count: number }

/** Every size with at least one tyre in stock, and its cheapest tyre. */
export async function loadStockedSizes(): Promise<StockedSize[]> {
  const tyres = await prisma.tyre.findMany({
    where:  inStock,
    select: { price: true, tyreSize: { select: { width: true, profile: true, rimDiameter: true } } },
  })
  const by = new Map<string, StockedSize>()
  for (const t of tyres) {
    const { width, profile, rimDiameter: rim } = t.tyreSize
    const key = sizeKey(width, profile, rim)
    const price = Number(t.price)
    const s = by.get(key)
    if (s) { s.count++; s.from = Math.min(s.from, price) }
    else by.set(key, { key, width, profile, rim, from: price, count: 1 })
  }
  return [...by.values()].sort((a, b) => a.width - b.width || a.profile - b.profile || a.rim - b.rim)
}

export interface Car { make: string; model: string; variant: string; years: number[]; sizes: string[] }

/** Cars with fitment data, one entry per make/model/trim. */
export async function loadCars(): Promise<Car[]> {
  const rows = await prisma.vehicle.findMany({
    where:   { fitments: { some: {} } },
    select:  { make: true, model: true, variant: true, year: true,
               fitments: { select: { tyreSize: { select: { width: true, profile: true, rimDiameter: true } } } } },
    orderBy: [{ make: 'asc' }, { model: 'asc' }, { year: 'desc' }],
  })
  const by = new Map<string, Car>()
  for (const v of rows) {
    const k = `${v.make}|${v.model}|${v.variant}`
    const car = by.get(k) ?? { make: v.make, model: v.model, variant: v.variant, years: [], sizes: [] }
    car.years.push(v.year)
    for (const f of v.fitments) {
      const key = sizeKey(f.tyreSize.width, f.tyreSize.profile, f.tyreSize.rimDiameter)
      if (!car.sizes.includes(key)) car.sizes.push(key)
    }
    by.set(k, car)
  }
  return [...by.values()]
}

export interface ResultTyre {
  slug: string; brand: string; model: string; type: string; price: number; stock: number
  size: string; spec: string; image: string | null; imageAlt: string
}

/** In-stock tyres, optionally in one size, cheapest first. */
export async function loadResultTyres(size?: { width: number; profile: number; rim: number }): Promise<ResultTyre[]> {
  const tyres = await prisma.tyre.findMany({
    where: { ...inStock, ...(size ? { tyreSize: { width: size.width, profile: size.profile, rimDiameter: size.rim } } : {}) },
    orderBy: [{ price: 'asc' }, { model: 'asc' }],
    select: {
      slug: true, brand: true, model: true, type: true, price: true, stockQuantity: true,
      tyreSize: { select: { width: true, profile: true, rimDiameter: true, loadIndex: true, speedRating: true } },
      images:   { select: { url: true, altText: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
    },
  })
  return tyres.map(t => ({
    slug: t.slug, brand: t.brand, model: t.model, type: t.type, price: Number(t.price), stock: t.stockQuantity,
    size: sizeLabel(t.tyreSize.width, t.tyreSize.profile, t.tyreSize.rimDiameter),
    spec: `${t.tyreSize.loadIndex ?? ''}${t.tyreSize.speedRating ?? ''}`,
    image: t.images[0]?.url ?? null,
    imageAlt: t.images[0]?.altText || `${t.brand} ${t.model}`,
  }))
}

/** A branch's record in the shape the cart and checkout keep in localStorage. */
export async function loadStoreRecord(slug: string) {
  return prisma.store.findFirst({
    where:  { slug, isActive: true, deletedAt: null },
    select: { id: true, name: true, address: true, suburb: true, state: true, postcode: true, phone: true },
  })
}
