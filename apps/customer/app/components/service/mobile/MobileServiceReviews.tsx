'use client'

import { useEffect, useState } from 'react'

/*
  "Google reviews across our stores" block from the Mobile Service Page
  artboard: a featured-review rotator, the rating-bar breakdown, location
  filter chips and a per-store review card carousel. Same review data as the
  desktop service page.
*/

const FEATURED = [
  { av: 'JM', c: '#FF5A1F', name: 'Jessica M.', meta: '2 days ago · Springvale', q: '"Top-notch service — honest, fast and the team genuinely cares. Couldn’t be happier!"' },
  { av: 'AP', c: '#2D6BFF', name: 'Andrew P.', meta: '5 days ago · Bayswater', q: '"Best workshop I’ve used. Clear quotes, quality parts, and they stand by their work."' },
  { av: 'ML', c: '#19D26A', name: 'Mei L.', meta: '1 week ago · Sefton', q: '"Booked online, sorted same day. Sydney finally has a Nova Tyres — so happy!"' },
]

const RATING_BARS = [
  { k: 5, w: 86, n: '2,041' }, { k: 4, w: 10, n: '243' }, { k: 3, w: 4, n: '61' }, { k: 2, w: 2, n: '24' }, { k: 1, w: 1, n: '15' },
]

const LOCATIONS = ['All locations', 'Springvale', 'Dandenong', 'Bayswater', 'Alphington', 'Sunshine', 'Sefton']

const REVIEW_CARDS = [
  { id: 'springvale', store: 'NOVA TYRES SPRINGVALE', loc: 'Springvale, VIC', rating: 4.9, count: 842, c: '#FF5A1F', av: 'DM', reviewer: 'Daniel M.', when: '2 weeks ago', quote: 'Same-day log book service, warranty stamp and all — no upsell.' },
  { id: 'dandenong', store: 'NOVA TYRES DANDENONG', loc: 'Dandenong, VIC', rating: 4.8, count: 511, c: '#2D6BFF', av: 'SK', reviewer: 'Sophie K.', when: '1 week ago', quote: 'Free pre-RWC check saved me a fortune. Genuinely helpful crew.' },
  { id: 'bayswater', store: 'NOVA TYRES BAYSWATER', loc: 'Bayswater, VIC', rating: 4.9, count: 388, c: '#19D26A', av: 'RT', reviewer: 'Raj T.', when: '3 days ago', quote: 'Ultimate Service and it drives like new. Call-back within the hour.' },
  { id: 'alphington', store: 'NOVA TYRES MELBOURNE', loc: 'Alphington, VIC', rating: 4.7, count: 276, c: '#FFB300', av: 'LN', reviewer: 'Lauren N.', when: '5 days ago', quote: 'Friendly, fast, fair priced. Dropped before work, ready by lunch.' },
  { id: 'sunshine', store: 'NOVA TYRES SUNSHINE', loc: 'Sunshine, VIC', rating: 4.8, count: 203, c: '#FF3B6B', av: 'MV', reviewer: 'Marco V.', when: '1 week ago', quote: 'Sorted my brakes same day and were clear about costs upfront.' },
  { id: 'sefton', store: 'NOVA TYRES SEFTON', loc: 'Sefton, NSW', rating: 4.9, count: 164, c: '#8B5CF6', av: 'PS', reviewer: 'Priya S.', when: '4 days ago', quote: 'So glad they’re in Sydney now. Quick, honest and tidy work.' },
]

const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=Nova+Tyres+reviews'

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700 }}>G</span>
        <span style={{ color: '#E8572A', fontSize: '9px' }}>★★★★★</span>
        <span style={{ fontSize: '10px', color: '#666' }}><b>4.8</b> average rating</span>
      </div>
      <h2 style={{ margin: '0 0 12px', fontSize: '17px', fontWeight: 800, color: '#16211B', lineHeight: 1.2 }}>
        Google reviews across our stores.
      </h2>

      {/* Featured rotator */}
      <div style={{ background: '#fff', border: '1px solid #E7E5DE', borderRadius: '12px', padding: '14px', position: 'relative' }}>
        <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '11px', fontWeight: 700 }}>G</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: feat.c, color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{feat.av}</span>
          <div>
            <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 800 }}>{feat.name}</span>
            <span style={{ fontSize: '8.5px', color: '#999' }}>{feat.meta}</span>
          </div>
        </div>
        <span style={{ display: 'block', color: '#E8572A', fontSize: '10px', marginTop: '8px' }}>★★★★★</span>
        <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#444', lineHeight: 1.5 }}>{feat.q}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          <button type="button" aria-label="Previous review" onClick={() => setFeatIdx(i => (i - 1 + FEATURED.length) % FEATURED.length)} style={navBtn}>‹</button>
          <span style={{ display: 'flex', gap: '4px' }}>
            {FEATURED.map((_, i) => (
              <i key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === featIdx ? '#E8572A' : '#ddd', display: 'block' }} />
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
              <i style={{ display: 'block', height: '100%', width: `${b.w}%`, background: '#E8572A' }} />
            </span>
            <span style={{ fontSize: '8.5px', color: '#999', width: '30px', textAlign: 'right' }}>{b.n}</span>
          </div>
        ))}
      </div>
      <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, marginTop: '8px', color: '#076330', textDecoration: 'none' }}>
        View all reviews on Google →
      </a>
      <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: '#16211B', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '11px', fontWeight: 700, marginTop: '10px', textDecoration: 'none' }}>
        ✎ Leave us a review
      </a>

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
                background: on ? '#076330' : '#fff', color: on ? '#fff' : '#666',
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
            <span style={{ color: '#E8572A', fontSize: '9px' }}>★★★★★</span>
            <span style={{ fontSize: '8.5px', color: '#999' }}>({cur.count})</span>
          </span>
          <div style={{ display: 'flex', gap: '7px', marginTop: '8px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: cur.c, color: '#fff', fontSize: '7px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cur.av}</span>
            <span style={{ fontSize: '9.5px', color: '#444', lineHeight: 1.4 }}>
              <b>{cur.reviewer}</b> · {cur.when}<br />{cur.quote}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '9px' }}>
            <a href={`https://www.google.com/search?q=Nova+Tyres+${cur.id}+reviews`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', border: '1px solid #E7E5DE', borderRadius: '6px', padding: '7px', fontSize: '9.5px', fontWeight: 700, color: '#16211B', textDecoration: 'none' }}>View reviews</a>
            <a href={`https://www.google.com/search?q=Nova+Tyres+${cur.id}+reviews`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#2D6BFF', color: '#fff', borderRadius: '6px', padding: '7px', fontSize: '9.5px', fontWeight: 700, textDecoration: 'none' }}>Open on Google ↗</a>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
        <button type="button" aria-label="Previous store" onClick={() => setStoreIdx(i => (i - 1 + cards.length) % cards.length)} style={{ ...navBtn, fontSize: '14px' }}>‹</button>
        <span style={{ display: 'flex', gap: '4px' }}>
          {cards.map((_, i) => (
            <i key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === safeIdx ? '#E8572A' : '#ddd', display: 'block' }} />
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
