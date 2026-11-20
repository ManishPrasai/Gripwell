import WheelCollectionHero from '../../../components/wheels/WheelCollectionHero'
import WheelGrid           from '../../../components/wheels/WheelGrid'

export const metadata = {
  title: 'Wheel Search Results — Gripwell',
  description: 'Find alloy wheels matching your brand, diameter and finish requirements.',
}

export default async function WheelResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; diameter?: string; width?: string; finish?: string }>
}) {
  const params = await searchParams

  return (
    <main style={{ background: '#F2F2F2' }}>
      <WheelCollectionHero />
      <WheelGrid
        initialBrand={params.brand}
        initialDiameter={params.diameter}
        initialWidth={params.width}
        initialFinish={params.finish}
      />
    </main>
  )
}
