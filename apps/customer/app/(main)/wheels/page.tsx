import WheelHero        from '../../components/wheels/WheelHero'
import FeaturedWheels   from '../../components/wheels/FeaturedWheels'
import FittingLocations from '../../components/tyres/FittingLocations'
import TyreInfoBar      from '../../components/tyres/TyreInfoBar'

import { pageMetadata }  from '../../../lib/seo'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'   // always reflect live PageSEO from admin

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('wheels', {
    title: 'Find Wheels — Nova Tyres',
    description: 'Search by brand, diameter and finish. Find the perfect alloy wheels for your vehicle from our huge range.',
  })
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
