import HeroSection       from '../components/home/HeroSection'
import BestDeals         from '../components/home/BestDeals'
import BrowseByCategory  from '../components/home/BrowseByCategory'
import BookingSection    from '../components/home/BookingSection'
import WhyNovaTyres      from '../components/home/WhyNovaTyres'
import BrandsStrip       from '../components/home/BrandsStrip'
import CustomerReviews   from '../components/home/CustomerReviews'
import StoreLocator      from '@/app/components/locations/StoreLocator'
import NewsletterSection from '../components/home/NewsletterSection'
import SocialGrid        from '../components/home/SocialGrid'
import { pageMetadata }  from '../../lib/seo'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'   // always reflect live PageSEO from admin

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('home', {
    title: 'Nova Tyres — Warehouse Direct Tyres & Wheels',
    description: 'Warehouse-direct pricing on tyres and wheels with professional fitting across 9 Australian locations.',
  })
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <BestDeals />
      <BrowseByCategory />
      <BookingSection />
      <WhyNovaTyres />
      <BrandsStrip />
      <CustomerReviews />
      <StoreLocator />
      <NewsletterSection />
      <SocialGrid />
    </main>
  )
}