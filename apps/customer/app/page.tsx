import HeroSection       from './components/home/HeroSection'
import BestDeals         from './components/home/BestDeals'
import BrowseByCategory  from './components/home/BrowseByCategory'
import BookingSection    from './components/home/BookingSection'
import WhyNovaTyres      from './components/home/WhyNovaTyres'
import BrandsStrip       from './components/home/BrandsStrip'
import CustomerReviews   from './components/home/CustomerReviews'
import StoreLocator      from './components/home/StoreLocator'
import NewsletterSection from './components/home/NewsletterSection'
import SocialGrid        from './components/home/SocialGrid'

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