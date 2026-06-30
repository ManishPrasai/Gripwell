import { notFound } from 'next/navigation'
import TyreProductDetail from '../../../components/product/TyreProductDetail'

/* ── Demo fallback used when the DB is not yet seeded ───────────────────── */
const DEMO_PRODUCTS: Record<string, object> = {
  default: {
    id: 'demo-1',
    brand: 'Continental', model: 'UltraContact UX7',
    description: "The UltraContact UX7 is Continental's latest touring tyre, delivering exceptional wet braking, responsive handling and low rolling resistance. Built for modern passenger vehicles that demand all-weather confidence.",
    type: 'PASSENGER', slug: 'continental-ultracontact-ux7-215-65r16',
    price: '100.00', compareAtPrice: '120.00', stockQuantity: 8,
    isBestSeller: false, isFeatured: true,
    fuelEfficiencyRating: 'B', wetGripRating: 'A', noiseLevelDb: 69,
    tyreSize: { width: 245, profile: 70, rimDiameter: 16, loadIndex: 118, speedRating: 'S', construction: 'R' },
    images: [{ url: '/images/tyres/Tyre 1.png', altText: 'Continental UltraContact UX7', sortOrder: 0 }],
    reviews: [
      { id: 'r1', rating: 5, title: 'Excellent wet grip', body: 'Best prices in Melbourne, hands down. Professional and way cheaper than anywhere else I quoted.', createdAt: new Date().toISOString(), customer: { firstName: 'Sarah', lastName: 'M.' } },
      { id: 'r2', rating: 5, title: 'Great value',        body: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional.',   createdAt: new Date().toISOString(), customer: { firstName: 'Sarah', lastName: 'M.' } },
      { id: 'r3', rating: 5, title: 'Highly recommend',  body: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional.',   createdAt: new Date().toISOString(), customer: { firstName: 'Sarah', lastName: 'M.' } },
    ],
  },
}

async function getProduct(slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res  = await fetch(`${base}/api/tyres/${slug}`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      return data.tyre ?? null
    }
  } catch {}
  /* fallback — return demo product for any slug */
  return DEMO_PRODUCTS[slug] ?? DEMO_PRODUCTS.default
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug) as { brand?: string; model?: string } | null
  if (!product) return {}
  return {
    title: `${product.brand} ${product.model} — Nova Tyres`,
    description: `Buy the ${product.brand} ${product.model} from Nova Tyres. Expert fitting available at 9 locations across Australia.`,
  }
}

export default async function TyreProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  return <TyreProductDetail product={product} />
}
