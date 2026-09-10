import TyreHero          from '../../components/tyres/TyreHero'
import ShopByTyreType    from '../../components/tyres/ShopByTyreType'
import BrandsWeServe     from '../../components/tyres/BrandsWeServe'
import FittingLocations  from '../../components/tyres/FittingLocations'
import TyreInfoBar       from '../../components/tyres/TyreInfoBar'
import TyreFAQ           from '../../components/tyres/TyreFAQ'
import MobileFindTyres   from '../../components/tyres/mobile/MobileFindTyres'
import { pageMetadata }  from '../../../lib/seo'
import { STORES }        from '../../../lib/stores'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'   // always reflect live PageSEO from admin

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('tyres', {
    title: 'Find Tyres — Nova Tyres',
    description: `Search by size or brand. Find the perfect tyres for your vehicle from our huge range across ${STORES.length} Australian stores.`,
  })
}

export default function FindTyresPage() {
  return (
    <>
      {/*
        Two designs, one route — same split as the homepage. Both trees are
        server-rendered; globals.css toggles [data-vw] by viewport so exactly
        one shows, with no JavaScript and no user-agent sniffing. This scoped
        rule hides the shared Navbar/Footer below 1024px on /tyres only, where
        MobileFindTyres brings its own header + bottom tab bar; it unmounts on
        navigation away.
      */}
      <style>{`@media (max-width:1023.98px){.nv-shared-chrome{display:none!important}}`}</style>

      <div data-vw="desktop">
        <main style={{ background: '#fff' }}>
          <TyreHero />
          <ShopByTyreType />
          <BrandsWeServe />
          <FittingLocations />
          <TyreInfoBar />
          <TyreFAQ />
        </main>
      </div>

      <div data-vw="mobile">
        <MobileFindTyres />
      </div>
    </>
  )
}
