import WheelHero        from '../../components/wheels/WheelHero'
import FeaturedWheels   from '../../components/wheels/FeaturedWheels'
import FittingLocations from '../../components/tyres/FittingLocations'
import TyreInfoBar      from '../../components/tyres/TyreInfoBar'
import MobileFindWheels from '../../components/wheels/mobile/MobileFindWheels'

import { pageMetadata }  from '../../../lib/seo'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'   // always reflect live PageSEO from admin

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('wheels', {
    title: 'Find Wheels — Gripwell',
    description: 'Search by brand, diameter and finish. Find the perfect alloy wheels for your vehicle from our huge range.',
  })
}

export default function FindWheelsPage() {
  return (
    <>
      {/* Two designs, one route — same split as /tyres and the homepage.
          Scoped rule hides the shared Navbar/Footer below 1024px on /wheels
          only, where MobileFindWheels brings its own header + tab bar. */}
      <style>{`@media (max-width:1023.98px){.nv-shared-chrome{display:none!important}}`}</style>

      <div data-vw="desktop">
        <main style={{ background: '#fff' }}>
          <WheelHero />
          <FeaturedWheels />
          <FittingLocations />
          <TyreInfoBar kind="wheels" />
        </main>
      </div>

      <div data-vw="mobile">
        <MobileFindWheels />
      </div>
    </>
  )
}
