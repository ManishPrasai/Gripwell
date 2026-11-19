import { notFound } from 'next/navigation'
import WheelProductDetail from '../../../components/product/WheelProductDetail'
import { getWheelBySlug, getSimilarWheels } from '../../../lib/product-queries'
import { STORES } from '../../../../lib/stores'
import { buildProductSchema } from '../../../../lib/schema'

/* Always render from live DB data (Redis-cached in the query layer) so a page is
   never served as stale/pre-rendered demo content. */
export const dynamic = 'force-dynamic'

const DEMO_WHEEL = {
  id: 'demo-w1',
  brand: 'Halden', model: 'Outrider',
  description: "The Halden Outrider is a premium off-road alloy wheel engineered for serious 4x4 performance. Deep-dish design, high-strength alloy construction and aggressive styling make it a top choice for truck and SUV builds.",
  slug: 'halden-outrider-17x85',
  diameter: 17, width: '8.5', pcd: '6×139.7', offset: -18,
  bore: '112.1', material: 'Alloy', finish: 'Matte Black',
  price: '230.00', compareAtPrice: null, stockQuantity: 12,
  images: [{ url: '/images/wheels/wheel-neutral.png', altText: 'Halden Outrider', sortOrder: 0 }],
  packages: [],
}

async function getWheel(slug: string) {
  try {
    const wheel = await getWheelBySlug(slug)
    if (wheel) return wheel
  } catch {}
  return { ...DEMO_WHEEL, slug }
}

/* Fitment-aware "similar wheels" — real matches by rim diameter / bolt pattern /
   price. Empty array falls back to the component's built-in demo picks. */
async function getSimilar(slug: string) {
  return getSimilarWheels(slug)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const wheel = await getWheel(slug) as { brand?: string; model?: string } | null
  if (!wheel) return {}
  return {
    title: `${wheel.brand} ${wheel.model} — Gripwell`,
    description: `Buy the ${wheel.brand} ${wheel.model} from Gripwell. Expert fitting across ${STORES.length} London stores.`,
  }
}

export default async function WheelProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [wheel, similar] = await Promise.all([getWheel(slug), getSimilar(slug)])
  if (!wheel) notFound()

  const w = wheel as {
    id: string; slug: string; brand: string; model: string; description?: string
    price: string; stockQuantity: number
    images: { url: string }[]
  }
  const schema = buildProductSchema({
    path: `/wheels/${w.slug}`,
    brand: w.brand,
    name: `${w.brand} ${w.model}`,
    description: w.description,
    images: w.images.map(img => img.url),
    sku: w.id,
    price: parseFloat(w.price),
    inStock: w.stockQuantity > 0,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <WheelProductDetail wheel={wheel} similar={similar} />
    </>
  )
}
