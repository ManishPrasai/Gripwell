'use client'

import { useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { money, quoteOrder } from '@/lib/fitting'
import type { Board } from '@/lib/fitting-board'
import type { Car, StockedSize } from '@/lib/catalogue'
import FittingBoard from './FittingBoard'
import s from './HomeFinder.module.css'

/* Size or car → the board's price column becomes the fitted price for 4.
   Navigation goes to the fitted results; nothing is booked here. */

type Mode = 'size' | 'car'
const uniq = <T,>(xs: T[]) => [...new Set(xs)]
const carName = (c: Car) => `${c.make} ${c.model} ${c.variant}`

export default function HomeFinder({ board, sizes, cars, children }: {
  board: Board | null
  sizes: StockedSize[]
  cars:  Car[]
  children: ReactNode            // headline + lede, server-rendered
}) {
  const router = useRouter()
  const id = useId()
  const [mode, setMode] = useState<Mode>('size')
  const [width, setWidth]     = useState('')
  const [profile, setProfile] = useState('')
  const [rim, setRim]         = useState('')
  const [make, setMake]       = useState('')
  const [carKey, setCarKey]   = useState('')   // index into cars
  const [year, setYear]       = useState('')
  const [error, setError]     = useState<string | null>(null)
  const firstRef = useRef<HTMLSelectElement>(null)

  // Size options narrow as you go, so every combination offered is in stock.
  const widths   = uniq(sizes.map(x => x.width))
  const profiles = uniq(sizes.filter(x => String(x.width) === width).map(x => x.profile))
  const rims     = uniq(sizes.filter(x => String(x.width) === width && String(x.profile) === profile).map(x => x.rim))

  const makes    = uniq(cars.map(c => c.make))
  const models   = cars.map((c, i) => ({ c, i })).filter(x => x.c.make === make)
  const car      = carKey === '' ? null : cars[Number(carKey)]

  const picked: StockedSize | null = useMemo(() => {
    if (mode === 'size') return sizes.find(x => String(x.width) === width && String(x.profile) === profile && String(x.rim) === rim) ?? null
    if (!car || !year) return null
    return sizes.find(x => car.sizes.includes(x.key)) ?? null
  }, [mode, sizes, width, profile, rim, car, year])

  const sizeQuery = picked ? `width=${picked.width}&profile=${picked.profile}&rim=${picked.rim}` : ''
  const carQuery  = mode === 'car' && car && year ? `&car=${encodeURIComponent(`${year} ${carName(car)}`)}` : ''
  const hrefFor   = (storeId: string) => `/tyres/results?${sizeQuery ? `${sizeQuery}${carQuery}&` : ''}store=${storeId}`

  const soonest = board?.rows.find(r => r.time) ?? board?.rows[0]
  const fittedFrom = picked && soonest
    ? quoteOrder({ lines: [{ productType: 'tyre', quantity: 4, unitPrice: picked.from }], fittingRate: soonest.fittingRate, fit: true }).total
    : null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!picked) {
      setError(mode === 'size' ? 'Choose a width, profile and rim size.' : 'Choose your make, model and year.')
      firstRef.current?.focus()
      return
    }
    router.push(`/tyres/results?${sizeQuery}${carQuery}`)
  }

  const errId = `${id}-err`
  const hintId = `${id}-hint`
  const describe = error ? `${errId} ${hintId}` : hintId

  return (
    <div className={s.grid}>
      <div className={s.left}>
        {children}

        <form className={s.form} role="search" aria-label="Find tyres" onSubmit={submit} noValidate id="find">
          <fieldset className={s.modes}>
            <legend className={s.srOnly}>Search by</legend>
            {(['size', 'car'] as const).map(m => (
              <label key={m} className={s.mode} data-on={mode === m}>
                <input type="radio" name={`${id}-mode`} value={m} checked={mode === m}
                  onChange={() => { setMode(m); setError(null) }} />
                {m === 'size' ? 'Tyre size' : 'Car'}
              </label>
            ))}
          </fieldset>

          {mode === 'size' ? (
            <div className={s.fields}>
              <Field label="Width" id={`${id}-w`}>
                <select ref={firstRef} id={`${id}-w`} value={width} aria-describedby={describe} aria-invalid={!!error && !width}
                  onChange={e => { setWidth(e.target.value); setProfile(''); setRim(''); setError(null) }}>
                  <option value="">–</option>
                  {widths.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </Field>
              <Field label="Profile" id={`${id}-p`}>
                <select id={`${id}-p`} value={profile} disabled={!width} aria-describedby={describe} aria-invalid={!!error && !profile}
                  onChange={e => { setProfile(e.target.value); setRim(''); setError(null) }}>
                  <option value="">–</option>
                  {profiles.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Rim" id={`${id}-r`}>
                <select id={`${id}-r`} value={rim} disabled={!profile} aria-describedby={describe} aria-invalid={!!error && !rim}
                  onChange={e => { setRim(e.target.value); setError(null) }}>
                  <option value="">–</option>
                  {rims.map(r => <option key={r} value={r}>R{r}</option>)}
                </select>
              </Field>
            </div>
          ) : (
            <div className={s.fields}>
              <Field label="Make" id={`${id}-mk`}>
                <select ref={firstRef} id={`${id}-mk`} value={make} aria-describedby={describe} aria-invalid={!!error && !make}
                  onChange={e => { setMake(e.target.value); setCarKey(''); setYear(''); setError(null) }}>
                  <option value="">–</option>
                  {makes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Model" id={`${id}-md`}>
                <select id={`${id}-md`} value={carKey} disabled={!make} aria-describedby={describe} aria-invalid={!!error && carKey === ''}
                  onChange={e => { setCarKey(e.target.value); setYear(''); setError(null) }}>
                  <option value="">–</option>
                  {models.map(({ c, i }) => (
                    <option key={i} value={i}>
                      {models.filter(x => x.c.model === c.model).length > 1 ? `${c.model} ${c.variant}` : c.model}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Year" id={`${id}-y`}>
                <select id={`${id}-y`} value={year} disabled={!car} aria-describedby={describe} aria-invalid={!!error && !year}
                  onChange={e => { setYear(e.target.value); setError(null) }}>
                  <option value="">–</option>
                  {car?.years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
            </div>
          )}

          {error && <p id={errId} className={s.error}>{error}</p>}
          <p id={hintId} className={s.hint}>
            {picked
              ? <>{mode === 'car' && car ? <>Fits {picked.key.replace('R', ' R')}. </> : null}
                  {picked.count} {picked.count === 1 ? 'tyre' : 'tyres'} in stock in this size
                  {fittedFrom != null && <>, from <strong>{money(fittedFrom)}</strong> for 4 fitted</>}.</>
              : mode === 'size'
                ? <>Your size is on the tyre&rsquo;s sidewall, for example 205/55 R16.</>
                : <>Factory size for that trim. Check your sidewall before you buy.</>}
          </p>

          <button type="submit" className={s.go}>Show tyres and prices</button>
        </form>
      </div>

      <div className={s.right}>
        <FittingBoard board={board} unitPrice={picked?.from ?? null} freshKey={picked?.key} hrefFor={hrefFor} />
      </div>
    </div>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className={s.field}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  )
}
