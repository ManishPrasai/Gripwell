import WheelCollectionHero from '../../components/wheels/WheelCollectionHero'
import WheelGrid           from '../../components/wheels/WheelGrid'

export const metadata = {
  title: 'Wheel Collection — Nova Tyres',
  description: 'Browse our full range of alloy wheels. Filter by brand, diameter and finish.',
}

export default function WheelCollectionPage() {
  return (
    <main style={{ background: '#F2F2F2' }}>
      <WheelCollectionHero />
      <WheelGrid />
    </main>
  )
}
