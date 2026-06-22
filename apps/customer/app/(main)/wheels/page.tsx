import WheelHero        from '../../components/wheels/WheelHero'
import FeaturedWheels   from '../../components/wheels/FeaturedWheels'
import FittingLocations from '../../components/tyres/FittingLocations'
import TyreInfoBar      from '../../components/tyres/TyreInfoBar'

export const metadata = {
  title: 'Find Wheels — Nova Tyres',
  description: 'Search by brand, diameter and finish. Find the perfect alloy wheels for your vehicle from our huge range.',
}

export default function FindWheelsPage() {
  return (
    <main style={{ background: '#fff' }}>
      <WheelHero />
      <FeaturedWheels />
      <FittingLocations />
      <TyreInfoBar />
    </main>
  )
}
