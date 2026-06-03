import { notFound } from 'next/navigation'
import WheelProductDetail from '../../components/product/WheelProductDetail'

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
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res  = await fetch(`${base}/api/wheels/${slug}`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      return data.wheel ?? null
    }
  } catch {}
  return { ...DEMO_WHEEL, slug }
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
  const wheel = await getWheel(slug)
  if (!wheel) notFound()
  return <WheelProductDetail wheel={wheel} />
}
