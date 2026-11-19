import { money } from '@/lib/fitting'
import { STORES } from '@/lib/stores'
import type { Board } from '@/lib/fitting-board'
import FittingBoard from './FittingBoard'
import s from './DeparturesHero.module.css'

/* Home first viewport: headline (+ search, stage 2) beside the live board. */
export default function DeparturesHero({ board }: { board: Board | null }) {
  const first = board?.rows.find(r => r.time)
  const when  = first?.day === 'Today' ? 'today' : first?.day === 'Tomorrow' ? 'tomorrow' : 'this week'
  const from  = board?.rows.length ? Math.min(...board.rows.map(r => r.fittingRate)) : null

  return (
    <section className={s.hero} aria-labelledby="home-title">
      <div className={s.inner}>
        <div className={s.copy}>
          <h1 id="home-title" className={s.title}>
            Tyres fitted {board ? when : ''} at {STORES.length} London branches.
          </h1>
          <p className={s.lede}>
            Every time on the board is a real free fitting bay.
            {from != null && <> Fitting from {money(from, { whole: true })} a wheel, balancing and valves included.</>}
            {' '}All prices include VAT.
          </p>
        </div>
        <div className={s.board}>
          <FittingBoard board={board} />
        </div>
      </div>
    </section>
  )
}
