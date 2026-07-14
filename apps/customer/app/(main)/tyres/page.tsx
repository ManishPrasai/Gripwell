import TyreHero          from '../../components/tyres/TyreHero'
import ShopByTyreType    from '../../components/tyres/ShopByTyreType'
import BrandsWeServe     from '../../components/tyres/BrandsWeServe'
import FittingLocations  from '../../components/tyres/FittingLocations'
import TyreInfoBar       from '../../components/tyres/TyreInfoBar'
import TyreFAQ           from '../../components/tyres/TyreFAQ'
import { pageMetadata }  from '../../../lib/seo'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'   // always reflect live PageSEO from admin

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('tyres', {
    title: 'Find Tyres — Nova Tyres',
    description: 'Search by size or brand. Find the perfect tyres for your vehicle from our huge range across 9 Australian locations.',
  })
}

export default function FindTyresPage() {
  return (
    <main style={{ background: '#fff' }}>
      <TyreHero />
      <ShopByTyreType />
      <BrandsWeServe />
      <FittingLocations />
      <TyreInfoBar />
      <TyreFAQ />
    </main>
  )
}
