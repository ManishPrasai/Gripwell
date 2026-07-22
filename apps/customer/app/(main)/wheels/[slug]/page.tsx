import { notFound } from 'next/navigation'
import WheelProductDetail from '../../../components/product/WheelProductDetail'
import { getWheelBySlug, getSimilarWheels } from '../../../lib/product-queries'

const DEMO_WHEEL = {
  id: 'demo-w1',
  brand: 'Black Rhino', model: 'AWOL',
  description: "The Black Rhino AWOL is a premium off-road alloy wheel engineered for serious 4WD performance. Deep-dish design, high-strength alloy construction and aggressive styling make it a top choice for truck and SUV builds.",
  slug: 'black-rhino-awol-17x85',
  diameter: 17, width: '8.5', pcd: '6×139.7', offset: -18,
  bore: '112.1', material: 'Alloy', finish: 'Matte Black',
  price: '230.00', compareAtPrice: null, stockQuantity: 12,
  images: [{ url: '/images/wheel/Wheel 1.png', altText: 'Black Rhino AWOL', sortOrder: 0 }],
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
    title: `${wheel.brand} ${wheel.model} — Nova Tyres`,
    description: `Buy the ${wheel.brand} ${wheel.model} from Nova Tyres. Expert fitting across 9 Australian locations.`,
  }
}

export default async function WheelProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [wheel, similar] = await Promise.all([getWheel(slug), getSimilar(slug)])
  if (!wheel) notFound()
  return <WheelProductDetail wheel={wheel} similar={similar} />
}
