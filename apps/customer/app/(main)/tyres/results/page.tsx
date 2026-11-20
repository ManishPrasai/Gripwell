import CollectionHero from '../../../components/tyres/CollectionHero'
import TyreGrid       from '../../../components/tyres/TyreGrid'
import FittedResults  from '../../../components/tyres/fitted/FittedResults'
import { loadBoard, type Board } from '../../../../lib/fitting-board'
import { loadResultTyres, loadStoreRecord, sizeLabel } from '../../../../lib/catalogue'

export const dynamic = 'force-dynamic'   // live slots and stock

export const metadata = {
  title: 'Tyres, fitted prices — Gripwell',
  description: 'Tyres in stock with the fitted price for a set of 4 at your chosen London branch, VAT included.',
}

const int = (v?: string) => (v && /^\d{1,3}$/.test(v) ? Number(v) : null)

export default async function TyreResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ width?: string; profile?: string; rim?: string; brand?: string; type?: string; q?: string; store?: string; car?: string }>
}) {
  const params = await searchParams

  // Brand, type and keyword browsing keep the existing grid until its own pass.
  if (params.brand || params.type || params.q) {
    return (
      <main style={{ background: '#F2F2F2' }}>
        <CollectionHero />
        <TyreGrid initialWidth={params.width} initialProfile={params.profile} initialRim={params.rim}
          initialBrand={params.brand} initialType={params.type} initialQ={params.q} />
      </main>
    )
  }

  const w = int(params.width), p = int(params.profile), r = int(params.rim)
  const size = w && p && r ? { width: w, profile: p, rim: r, label: sizeLabel(w, p, r) } : null

  const [board, tyres] = await Promise.all([
    loadBoard().catch((e): Board | null => { console.error('[results] board', e); return null }),
    loadResultTyres(size ?? undefined),
  ])
  // The branch asked for, else the one with the soonest free bay.
  const branch = board?.rows.find(x => x.storeId === params.store) ?? board?.rows.find(x => x.time) ?? board?.rows[0] ?? null
  const store  = branch ? await loadStoreRecord(branch.storeId) : null
  const car    = params.car ? params.car.slice(0, 80) : null

  return <FittedResults tyres={tyres} board={board} branch={branch} store={store} size={size} car={car} />
}
