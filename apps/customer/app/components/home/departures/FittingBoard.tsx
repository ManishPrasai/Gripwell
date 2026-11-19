import Link from 'next/link'
import { money, quoteOrder } from '@/lib/fitting'
import { NOVA_SWITCHBOARD, NOVA_SWITCHBOARD_HREF } from '@/lib/stores'
import type { Board, BoardRow } from '@/lib/fitting-board'
import s from './FittingBoard.module.css'

/* ── Fitting departures ────────────────────────────────────────────────
   One dark object on a light page: a real table of the next free fitting
   bay at each branch. No live region and no ticking: it is read, not
   announced. With a tyre price it shows the fitted price for a set of 4.
──────────────────────────────────────────────────────────────────────── */

const SET = 4

function fittedTotal(unitPrice: number, rate: number) {
  return quoteOrder({ lines: [{ productType: 'tyre', quantity: SET, unitPrice }], fittingRate: rate, fit: true }).total
}

/** Soonest reads strongest: the earliest start today, then the next start
    time, then everything later. Rows sharing a time share a rank. */
function ranker(rows: BoardRow[]) {
  const times = [...new Set(rows.filter(r => r.day === 'Today' && r.time).map(r => r.time!))].sort()
  return (r: BoardRow) => {
    const i = r.day === 'Today' && r.time ? times.indexOf(r.time) : -1
    return i === 0 ? s.r1 : i === 1 ? s.r2 : s.r3
  }
}

export default function FittingBoard({
  board,
  unitPrice = null,
  hrefFor = id => `/tyres?store=${id}`,
}: {
  board:      Board | null
  unitPrice?: number | null
  hrefFor?:   (storeId: string) => string
}) {
  if (!board) {
    return (
      <div className={s.board}>
        <p className={s.title}>Free bays</p>
        <p className={s.fail}>
          Live times are unavailable right now. Call <a href={NOVA_SWITCHBOARD_HREF}>{NOVA_SWITCHBOARD}</a> and we&rsquo;ll find you a bay.
        </p>
      </div>
    )
  }

  const today  = board.rows.some(r => r.day === 'Today')
  const dated  = new Date(`${board.now.date}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' })
  const priced = unitPrice != null
  const rank   = ranker(board.rows)

  return (
    <div className={s.board}>
      <table className={s.table}>
        <caption className={s.caption}>
          <span className={s.capRow}>
            <span className={s.title}>{today ? 'Free bays today' : 'Next free bays'}</span>
            <span className={s.meta}>{dated} · as of {board.now.clock}</span>
          </span>
        </caption>
        <thead>
          <tr>
            <th scope="col" className={s.cTime}>Time</th>
            <th scope="col" className={s.cBranch}>Branch</th>
            <th scope="col" className={s.cPrice}>{priced ? `${SET} fitted` : 'Fitting'}</th>
            <th scope="col" className={s.cBays}>Bays</th>
          </tr>
        </thead>
        <tbody>
          {board.rows.map(r => (
            <tr key={r.storeId} className={rank(r)}>
              <td className={s.time}>
                {r.time ? <span className={s.dots}>{r.time}</span> : <span className={s.none}>None</span>}
                {r.day && r.day !== 'Today' && <span className={s.day}>{r.day}</span>}
              </td>
              <th scope="row" className={s.branch}>
                <Link href={hrefFor(r.storeId)} className={s.link}>{r.short}</Link>
                <span className={s.area}>{r.area.split(' ').slice(-2).join(' ')}</span>
              </th>
              <td className={s.price}>
                {priced
                  ? <>{money(fittedTotal(unitPrice, r.fittingRate))}<span className={s.unit}>incl. VAT</span></>
                  : <>{money(r.fittingRate, { whole: true })}<span className={s.unit}>per wheel</span></>}
              </td>
              <td className={s.bays}>
                {r.time ? `${r.free} free` : 'Full this week'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
