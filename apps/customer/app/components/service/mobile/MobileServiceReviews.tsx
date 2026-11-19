'use client'

import { useEffect, useState } from 'react'

/*
  "Google reviews across our stores" block from the Mobile Service Page
  artboard: a featured-review rotator, the rating-bar breakdown, location
  filter chips and a per-store review card carousel. Same review data as the
  desktop service page.
*/

const FEATURED = [
  { av: 'JM', c: '#FF5A1F', name: 'Jessica M.', meta: '2 days ago · Camden', q: '"Top-notch service — honest, fast and the team genuinely cares. Couldn’t be happier!"' },
  { av: 'AP', c: '#2D6BFF', name: 'Andrew P.', meta: '5 days ago · Shoreditch', q: '"Best workshop I’ve used. Clear quotes, quality parts, and they stand by their work."' },
  { av: 'ML', c: '#19D26A', name: 'Mei L.', meta: '1 week ago · Brixton', q: '"Booked online, sorted same day. Brilliant service from start to finish."' },
]

const RATING_BARS = [
  { k: 5, w: 86, n: '2,041' }, { k: 4, w: 10, n: '243' }, { k: 3, w: 4, n: '61' }, { k: 2, w: 2, n: '24' }, { k: 1, w: 1, n: '15' },
]

const LOCATIONS = ['All locations', 'Camden', 'Shoreditch', 'Brixton', 'Hammersmith', 'Islington', 'Greenwich', 'City']

const REVIEW_CARDS = [
  { id: 'camden', store: 'Gripwell CAMDEN', loc: 'Camden, North', rating: 4.9, count: 842, c: '#FF5A1F', av: 'DM', reviewer: 'Daniel M.', when: '2 weeks ago', quote: 'Same-day service, honest pricing and no upsell. Exactly what you want.' },
  { id: 'shoreditch', store: 'Gripwell SHOREDITCH', loc: 'Shoreditch, East', rating: 4.8, count: 511, c: '#2D6BFF', av: 'SK', reviewer: 'Sophie K.', when: '1 week ago', quote: 'Free safety check saved me a fortune. Genuinely helpful crew.' },
  { id: 'brixton', store: 'Gripwell BRIXTON', loc: 'Brixton, South', rating: 4.9, count: 388, c: '#19D26A', av: 'RT', reviewer: 'Raj T.', when: '3 days ago', quote: 'Ultimate Service and it drives like new. Call-back within the hour.' },
  { id: 'hammersmith', store: 'Gripwell HAMMERSMITH', loc: 'Hammersmith, West', rating: 4.7, count: 276, c: '#FFB300', av: 'LN', reviewer: 'Lauren N.', when: '5 days ago', quote: 'Friendly, fast, fair priced. Dropped before work, ready by lunch.' },
  { id: 'islington', store: 'Gripwell ISLINGTON', loc: 'Islington, North', rating: 4.8, count: 203, c: '#FF3B6B', av: 'MV', reviewer: 'Marco V.', when: '1 week ago', quote: 'Sorted my brakes same day and were clear about costs upfront.' },
  { id: 'citycentre', store: 'Gripwell CITY', loc: 'City, Central', rating: 4.9, count: 164, c: '#8B5CF6', av: 'PS', reviewer: 'Priya S.', when: '4 days ago', quote: 'So convenient in the City. Quick, honest and tidy work.' },
]


export default function MobileServiceReviews() {
  const [featIdx, setFeatIdx] = useState(0)
  const [loc, setLoc] = useState('All locations')
  const [storeIdx, setStoreIdx] = useState(0)

  const cards = loc === 'All locations'
    ? REVIEW_CARDS
    : REVIEW_CARDS.filter(c => c.loc.startsWith(loc))
  const safeIdx = storeIdx % Math.max(cards.length, 1)
  const cur = cards[safeIdx] ?? REVIEW_CARDS[0]

  /* Featured rotator — 6s, resets on manual nav. */
  useEffect(() => {
    const t = setInterval(() => setFeatIdx(i => (i + 1) % FEATURED.length), 6000)
    return () => clearInterval(t)
  }, [featIdx])

  const feat = FEATURED[featIdx]

  return (
    <section style={{ background: '#FAF9F5', padding: '22px 16px 24px', borderTop: '1px solid #E7E5DE' }}>
      <div style={{ marginBottom: '6px' }}><span style={{ display: 'inline-block', background: '#2A2E36', color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '4px' }}>SAMPLE DATA</span></div>
      <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#1A1D23', lineHeight: 1.2 }}>
        Example reviews across our stores.
      </h2>
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#4B5563', lineHeight: 1.5 }}>Gripwell is a fictional shop, so these reviews, ratings and counts are made up to show the layout.</p>

      {/* Featured rotator */}
      <div style={{ background: '#fff', border: '1px solid #E7E5DE', borderRadius: '12px', padding: '14px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: feat.c, color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{feat.av}</span>
          <div>
            <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 800 }}>{feat.name}</span>
            <span style={{ fontSize: '8.5px', color: '#999' }}>{feat.meta}</span>
          </div>
        </div>
        <span style={{ display: 'block', color: '#FF6A1A', fontSize: '10px', marginTop: '8px' }}>★★★★★</span>
        <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#444', lineHeight: 1.5 }}>{feat.q}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          <button type="button" aria-label="Previous review" onClick={() => setFeatIdx(i => (i - 1 + FEATURED.length) % FEATURED.length)} style={navBtn}>‹</button>
          <span style={{ display: 'flex', gap: '4px' }}>
            {FEATURED.map((_, i) => (
              <i key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === featIdx ? '#FF6A1A' : '#ddd', display: 'block' }} />
            ))}
          </span>
          <button type="button" aria-label="Next review" onClick={() => setFeatIdx(i => (i + 1) % FEATURED.length)} style={navBtn}>›</button>
        </div>
      </div>

      {/* Rating bars */}
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {RATING_BARS.map(b => (
          <div key={b.k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px', color: '#666', width: '18px' }}>{b.k}★</span>
            <span style={{ flex: 1, height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
              <i style={{ display: 'block', height: '100%', width: `${b.w}%`, background: '#FF6A1A' }} />
            </span>
            <span style={{ fontSize: '8.5px', color: '#999', width: '30px', textAlign: 'right' }}>{b.n}</span>
          </div>
        ))}
      </div>

      {/* Location filter chips */}
      <div className="nv-mob-pills" style={{ marginTop: '16px' }}>
        {LOCATIONS.map(l => {
          const on = loc === l
          return (
            <button
              key={l}
              type="button"
              onClick={() => { setLoc(l); setStoreIdx(0) }}
              style={{
                background: on ? '#2A2E36' : '#fff', color: on ? '#fff' : '#666',
                border: on ? 'none' : '1px solid #E7E5DE', fontSize: '10px', fontWeight: 700,
                borderRadius: '14px', padding: '6px 12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {l}
            </button>
          )
        })}
      </div>

      {/* Per-store review card */}
      <div style={{ background: '#fff', border: '1px solid #E7E5DE', borderRadius: '12px', overflow: 'hidden', marginTop: '12px' }}>
        <div style={{ position: 'relative', height: '80px', background: 'linear-gradient(160deg,#12241A,#0A150F)' }}>
          <span style={{ position: 'absolute', top: '9px', left: '9px', background: 'rgba(0,0,0,.55)', color: '#fff', borderRadius: '5px', padding: '4px 8px', fontSize: '9px', fontWeight: 700 }}>📍 {cur.loc}</span>
          <span style={{ position: 'absolute', bottom: '8px', right: '8px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>G</span>
        </div>
        <div style={{ padding: '12px' }}>
          <span style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.02em' }}>{cur.store}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
            <b style={{ fontSize: '10.5px' }}>{cur.rating}</b>
            <span style={{ color: '#FF6A1A', fontSize: '9px' }}>★★★★★</span>
            <span style={{ fontSize: '8.5px', color: '#999' }}>({cur.count})</span>
          </span>
          <div style={{ display: 'flex', gap: '7px', marginTop: '8px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: cur.c, color: '#fff', fontSize: '7px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cur.av}</span>
            <span style={{ fontSize: '9.5px', color: '#444', lineHeight: 1.4 }}>
              <b>{cur.reviewer}</b> · {cur.when}<br />{cur.quote}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '9px' }}>
            <a href={`https://www.google.com/search?q=Gripwell+${cur.id}+reviews`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', border: '1px solid #E7E5DE', borderRadius: '6px', padding: '7px', fontSize: '9.5px', fontWeight: 700, color: '#1A1D23', textDecoration: 'none' }}>View reviews</a>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
        <button type="button" aria-label="Previous store" onClick={() => setStoreIdx(i => (i - 1 + cards.length) % cards.length)} style={{ ...navBtn, fontSize: '14px' }}>‹</button>
        <span style={{ display: 'flex', gap: '4px' }}>
          {cards.map((_, i) => (
            <i key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === safeIdx ? '#FF6A1A' : '#ddd', display: 'block' }} />
          ))}
        </span>
        <button type="button" aria-label="Next store" onClick={() => setStoreIdx(i => (i + 1) % cards.length)} style={{ ...navBtn, fontSize: '14px' }}>›</button>
      </div>
    </section>
  )
}

const navBtn: React.CSSProperties = {
  color: '#999', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', lineHeight: 1,
}
