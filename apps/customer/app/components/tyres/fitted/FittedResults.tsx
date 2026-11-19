import Link from 'next/link'
import Image from 'next/image'
import { DEFAULT_FITTING_PRICES, money, quoteOrder } from '@/lib/fitting'
import { NOVA_SWITCHBOARD, NOVA_SWITCHBOARD_HREF } from '@/lib/stores'
import type { Board, BoardRow } from '@/lib/fitting-board'
import type { ResultTyre } from '@/lib/catalogue'
import AddSetButton, { type StoreRecord } from './AddSetButton'
import s from './FittedResults.module.css'

/* Fitted results: one list, cheapest fitted set first, priced at the chosen
   branch. The branch strip uses the board's own data (next free bay). */

const SET = 4
const TYPE_LABEL: Record<string, string> = {
  PASSENGER: 'Car', SUV: 'SUV / 4x4', MUD_TERRAIN: 'Mud-terrain', COMMERCIAL: 'Van',
}

export default function FittedResults({ tyres, board, branch, store, size, car }: {
  tyres:  ResultTyre[]
  board:  Board | null
  branch: BoardRow | null
  store:  StoreRecord | null
  size:   { width: number; profile: number; rim: number; label: string } | null
  car:    string | null
}) {
  const rate = branch?.fittingRate ?? DEFAULT_FITTING_PRICES.passenger
  const fitted = (price: number) =>
    quoteOrder({ lines: [{ productType: 'tyre', quantity: SET, unitPrice: price }], fittingRate: rate, fit: true }).total
  const sizeQuery = size ? `width=${size.width}&profile=${size.profile}&rim=${size.rim}${car ? `&car=${encodeURIComponent(car)}` : ''}&` : ''

  return (
    <main className={s.page}>
      <div className={s.inner}>
        <header className={s.head}>
          <p className={s.back}><Link href="/#find">Change size or car</Link></p>
          <h1 className={s.title}>
            {size ? <>{size.label} tyres</> : <>Tyres in stock</>}
            {branch && <>, fitted at {branch.short}</>}
          </h1>
          {car && <p className={s.car}>Factory size for a {car}. Check the size on your tyre&rsquo;s sidewall before you buy.</p>}
        </header>

        {board && (
          <nav className={s.branches} aria-label="Fitting branch">
            <ul>
              {board.rows.map(r => (
                <li key={r.storeId}>
                  <Link href={`/tyres/results?${sizeQuery}store=${r.storeId}`} className={s.branch}
                    aria-current={r.storeId === branch?.storeId ? 'true' : undefined}>
                    <span className={s.bName}>{r.short}</span>
                    <span className={s.bTime}>{r.time ? `${r.day === 'Today' ? '' : `${r.day} `}${r.time}` : 'Full'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <p className={s.next}>
          {branch?.time
            ? <>Next free bay at {branch.short}: <strong>{branch.day === 'Today' ? 'today' : branch.day} {branch.time}</strong> ({branch.free} free).
                {' '}Fitting {money(rate, { whole: true })} a wheel, balancing and valves included. You choose the exact time at checkout.</>
            : <>No free bays at {branch?.short ?? 'this branch'} this week. Pick another branch above, or call <a href={NOVA_SWITCHBOARD_HREF}>{NOVA_SWITCHBOARD}</a>.</>}
        </p>

        {tyres.length === 0 ? (
          <div className={s.empty}>
            <h2>{size ? `No ${size.label} tyres in stock right now.` : 'Nothing in stock right now.'}</h2>
            <p>Call <a href={NOVA_SWITCHBOARD_HREF}>{NOVA_SWITCHBOARD}</a> and we&rsquo;ll check whether we can order them in.
              {size && <> Or <Link href={`/tyres/results?store=${branch?.storeId ?? ''}`}>see every tyre we have in stock</Link>.</>}</p>
          </div>
        ) : (
          <>
            <p className={s.count}>{tyres.length} {tyres.length === 1 ? 'tyre' : 'tyres'}, cheapest fitted set first. Prices include VAT.</p>
            <ol className={s.list}>
              {tyres.map(t => (
                <li key={t.slug} className={s.row}>
                  <div className={s.pic}>
                    {t.image && <Image src={t.image} alt="" width={88} height={88} />}
                  </div>
                  <div className={s.info}>
                    <p className={s.brand}>{t.brand}</p>
                    <h2 className={s.model}><Link href={`/tyres/${t.slug}`}>{t.model}</Link></h2>
                    <p className={s.meta}>
                      <span>{t.size} {t.spec}</span>
                      <span>{TYPE_LABEL[t.type] ?? t.type}</span>
                      <span>{t.stock} in stock</span>
                    </p>
                  </div>
                  <div className={s.buy}>
                    <p className={s.total}>{money(fitted(t.price))}</p>
                    <p className={s.totalNote}>{SET} fitted{branch ? ` at ${branch.short}` : ''}</p>
                    <p className={s.each}>{money(t.price)} a tyre + {money(rate, { whole: true })} fitting each</p>
                    <AddSetButton
                      item={{ id: t.slug, productType: 'tyre', brand: t.brand, brandLogo: '', model: t.model,
                              size: t.size, spec: t.spec, price: t.price, image: t.image ?? '' }}
                      qty={SET}
                      store={store}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </main>
  )
}
