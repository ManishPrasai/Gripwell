import CollectionHero from '../../components/tyres/CollectionHero'
import TyreGrid       from '../../components/tyres/TyreGrid'

export const metadata = {
  title: 'Tyre Search Results — Nova Tyres',
  description: 'Find tyres matching your size and brand requirements.',
}

export default async function TyreResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ width?: string; profile?: string; rim?: string; brand?: string; type?: string }>
}) {
  const params = await searchParams

  return (
    <main style={{ background: '#F2F2F2' }}>
      <CollectionHero />
      <TyreGrid
        initialWidth={params.width}
        initialProfile={params.profile}
        initialRim={params.rim}
        initialBrand={params.brand}
        initialType={params.type}
      />
    </main>
  )
}
