import { money } from '@/lib/fitting'
import { STORES } from '@/lib/stores'
import type { Board } from '@/lib/fitting-board'
import type { Car, StockedSize } from '@/lib/catalogue'
import HomeFinder from './HomeFinder'
import s from './DeparturesHero.module.css'

/* Home first viewport: headline and search beside the live board. */
export default function DeparturesHero({ board, sizes, cars }: { board: Board | null; sizes: StockedSize[]; cars: Car[] }) {
  const first = board?.rows.find(r => r.time)
  const when  = first?.day === 'Today' ? 'today' : first?.day === 'Tomorrow' ? 'tomorrow' : 'this week'
  const from  = board?.rows.length ? Math.min(...board.rows.map(r => r.fittingRate)) : null

  return (
    <section className={s.hero} aria-labelledby="home-title">
      <HomeFinder board={board} sizes={sizes} cars={cars}>
        <h1 id="home-title" className={s.title}>
          Tyres fitted {board ? `${when} ` : ''}at {STORES.length} London branches.
        </h1>
        <p className={s.lede}>
          Every time on the board is a real free fitting bay.
          {from != null && <> Fitting from {money(from, { whole: true })} a wheel, balancing and valves included.</>}
          {' '}All prices include VAT.
        </p>
      </HomeFinder>
    </section>
  )
}
