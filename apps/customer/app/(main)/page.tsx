import HeroSection       from '../components/home/HeroSection'
import BestDeals         from '../components/home/BestDeals'
import BrowseByCategory  from '../components/home/BrowseByCategory'
import InStoreServices   from '../components/home/InStoreServices'
import Whygripwell      from '../components/home/Whygripwell'
import BrandsStrip       from '../components/home/BrandsStrip'
import CustomerReviews   from '../components/home/CustomerReviews'
import StoreLocator      from '@/app/components/locations/StoreLocator'
import NewsletterSection from '../components/home/NewsletterSection'
import SocialGrid        from '../components/home/SocialGrid'
import MobileStickyBar   from '../components/layout/MobileStickyBar'
import MobileHome        from '../components/home/mobile/MobileHome'
import { pageMetadata }  from '../../lib/seo'
import { STORES }        from '../../lib/stores'
import { loadBoard, type Board } from '../../lib/fitting-board'
import DeparturesHero    from '../components/home/departures/DeparturesHero'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'   // always reflect live PageSEO from admin

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('home', {
    title: 'Gripwell — Warehouse Direct Tyres & Wheels',
    description: `Warehouse-direct pricing on tyres and wheels with professional fitting across ${STORES.length} London stores.`,
  })
}

export default async function HomePage() {
  // A failed load shows the board's own "call us" state, never a broken page.
  const board: Board | null = await loadBoard().catch(e => { console.error('[home] board', e); return null })
  const hero = <DeparturesHero board={board} />

  return (
    <>
      {/*
        Two homepage designs, one page. Both are server-rendered into the HTML;
        globals.css toggles [data-vw] by viewport so exactly one shows. The
        switch is instant on resize, runs no JavaScript, and needs no
        user-agent sniffing — the page stays a single cacheable response.

        This scoped rule hides the shared Navbar/Footer (from (main)/layout.tsx)
        on the homepage only, below 1024px, where MobileHome brings its own
        header + bottom tab bar. It unmounts when you navigate away.
      */}
      <style>{`@media (max-width:1023.98px){.nv-shared-chrome{display:none!important}}`}</style>

      <div data-vw="desktop">
        <main style={{ background: '#FAF9F5', color: '#1A1D23' }}>
          {hero}
          <HeroSection />
          <BestDeals />
          <BrowseByCategory />
          <InStoreServices />
          <Whygripwell />
          <BrandsStrip />
          <CustomerReviews />
          <StoreLocator />
          <NewsletterSection />
          <SocialGrid />
          <MobileStickyBar />
        </main>
      </div>

      <div data-vw="mobile">
        <MobileHome hero={hero} />
      </div>
    </>
  )
}
