import CollectionHero from '../../../components/tyres/CollectionHero'
import TyreGrid       from '../../../components/tyres/TyreGrid'

export const metadata = {
  title: 'Tyre Collection — Nova Tyres',
  description: 'Browse our full range of premium tyres. Filter by brand, size and type.',
}

export default function TyreCollectionPage() {
  return (
    <main style={{ background: '#F2F2F2' }}>
      <CollectionHero />
      <TyreGrid />
    </main>
  )
}
