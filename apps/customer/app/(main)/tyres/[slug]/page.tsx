import { notFound } from 'next/navigation'
import TyreProductDetail from '../../../components/product/TyreProductDetail'
import { getTyreBySlug, getSimilarTyres } from '../../../lib/product-queries'
import { STORES } from '../../../../lib/stores'
import { buildProductSchema } from '../../../../lib/schema'

/* Always render from live DB data (Redis-cached in the query layer) so a page is
   never served as stale/pre-rendered demo content. */
export const dynamic = 'force-dynamic'

/* ── Demo fallback used when the DB is not yet seeded ───────────────────── */
const DEMO_PRODUCTS: Record<string, object> = {
  default: {
    id: 'demo-1',
    brand: 'Meridian', model: 'Citadel UX7',
    description: "The Citadel UX7 is Meridian's latest touring tyre, delivering exceptional wet braking, responsive handling and low rolling resistance. Built for modern passenger vehicles that demand all-weather confidence.",
    type: 'PASSENGER', slug: 'meridian-citadel-ux7-215-65r16',
    price: '100.00', compareAtPrice: null, stockQuantity: 8,
    isBestSeller: false, isFeatured: true,
    fuelEfficiencyRating: 'B', wetGripRating: 'A', noiseLevelDb: 69,
    tyreSize: { width: 245, profile: 70, rimDiameter: 16, loadIndex: 118, speedRating: 'S', construction: 'R' },
    images: [{ url: '/images/tyres/Tyre 1.png', altText: 'Meridian Citadel UX7', sortOrder: 0 }],
    reviews: [],
  },
}

async function getProduct(slug: string) {
  try {
    const tyre = await getTyreBySlug(slug)
    if (tyre) return tyre
  } catch {}
  /* fallback — return demo product only when the DB has nothing for this slug */
  return DEMO_PRODUCTS[slug] ?? DEMO_PRODUCTS.default
}

/* Fitment-aware "similar tyres" — real matches by rim size / category / price.
   Empty array falls back to the component's built-in demo picks. */
async function getSimilar(slug: string) {
  return getSimilarTyres(slug)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug) as { brand?: string; model?: string } | null
  if (!product) return {}
  return {
    title: `${product.brand} ${product.model} — Gripwell`,
    description: `Buy the ${product.brand} ${product.model} from Gripwell. Expert fitting available at ${STORES.length} stores across London.`,
  }
}

export default async function TyreProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, similar] = await Promise.all([getProduct(slug), getSimilar(slug)])
  if (!product) notFound()

  const p = product as {
    id: string; slug: string; brand: string; model: string; description?: string
    price: string; stockQuantity: number
    images: { url: string }[]
    reviews: { rating: number }[]
  }
  const reviewCount = p.reviews.length
  const avg = reviewCount > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0
  const schema = buildProductSchema({
    path: `/tyres/${p.slug}`,
    brand: p.brand,
    name: `${p.brand} ${p.model}`,
    description: p.description,
    images: p.images.map(img => img.url),
    sku: p.id,
    price: parseFloat(p.price),
    inStock: p.stockQuantity > 0,
    rating: reviewCount > 0 ? { value: avg, count: reviewCount } : undefined,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <TyreProductDetail product={product} similar={similar} />
    </>
  )
}
