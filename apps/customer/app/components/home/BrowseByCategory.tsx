import Link from 'next/link'
import Image from 'next/image'

/*
  "Find the right tyre for your drive" — the Shop-by-category grid.

  The TyreType enum is PASSENGER | SUV | COMMERCIAL | MUD_TERRAIN, so the
  "Commercial" card points at that filter; "Wheels" jumps to the wheels
  catalogue. Each href resolves to a filter the catalogue can actually serve.

  Image balance: the source assets don't share an aspect ratio — the tyre
  shots are ~1664x2432 (tall), the wheel is ~447x559 (flatter) — so every
  image sits in a fixed-height `.nv-cat-figure` that flex-centres and
  `object-fit: contain`s it. Per-category perceptual tuning is a single knob,
  the `--img-scale` custom property, keyed off `data-category` (see <style>).
*/
const CATEGORIES = [
  { key: 'passenger',  name: 'Passenger',   blurb: 'Quiet & economical', href: '/tyres/results?type=PASSENGER',   img: '/images/tyres/tyre-passenger.png',   alt: 'Passenger car tyre',  w: 1664, h: 2432 },
  { key: 'suv',        name: '4x4 / SUV',   blurb: 'Built for load',     href: '/tyres/results?type=SUV',         img: '/images/tyres/tyre-suv.png',         alt: '4x4 and SUV tyre',    w: 1664, h: 2432 },
  { key: 'commercial', name: 'Commercial',  blurb: 'Vans & pickups',        href: '/tyres/results?type=COMMERCIAL',  img: '/images/tyres/tyre-all-terrain.png', alt: 'Commercial van tyre', w: 1664, h: 2432 },
  { key: 'mud',        name: 'Mud-Terrain', blurb: 'Maximum bite',       href: '/tyres/results?type=MUD_TERRAIN', img: '/images/tyres/tyre-mud.png',         alt: 'Mud-terrain tyre',    w: 1584, h: 2336 },
  { key: 'wheels',     name: 'Wheels',      blurb: 'Alloy & packages',   href: '/wheels',                         img: '/images/wheels/king-kt5.png',        alt: 'Alloy wheel',         w: 447,  h: 559 },
]

export default function BrowseByCategory() {
  return (
    <section style={{ background: '#FFFFFF', borderTop: '1px solid #E7E5DE', padding: 'clamp(52px,6vw,80px) 0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .nv-cat-grid { display: grid; gap: 20px; grid-template-columns: repeat(5,minmax(0,1fr)); }
        @media (max-width: 1100px) { .nv-cat-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        @media (max-width: 780px)  { .nv-cat-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media (max-width: 520px)  { .nv-cat-grid { grid-template-columns: 1fr; } }

        .nv-cat-card { position: relative; display: flex; flex-direction: column; background: #FFFFFF; border: 1px solid #E7E5DE; border-radius: 18px; padding: 24px; text-decoration: none; color: #1A1D23; transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s, border-color .22s; }
        .nv-cat-card:hover { border-color: #C9C7BE; transform: translateY(-5px); box-shadow: 0 6px 10px rgba(20,25,22,0.08), 0 26px 50px -22px rgba(20,25,22,0.34); }

        /* One fixed stage for every product shot: identical height on every
           card, flex-centred both axes, inset off the card edge, and clipped
           so a perceptual scale-up can't bleed past the frame. */
        .nv-cat-figure {
          --img-scale: 1;
          display: flex; align-items: center; justify-content: center;
          height: 224px; padding: 14px; margin-bottom: 20px; overflow: hidden;
        }
        .nv-cat-img {
          max-width: 100%; max-height: 100%; width: auto; height: auto;
          object-fit: contain; transform: scale(var(--img-scale));
        }

        /* Perceptual balance knob — the wheel/rim asset is flatter and reads
           small next to the tall tyre shots, so nudge it up. Add a line per
           category (e.g. a chunky tread that reads heavy → scale below 1). */
        .nv-cat-card[data-category="wheels"] .nv-cat-figure { --img-scale: 1.12; }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div
          data-reveal
          style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: '16px 24px', marginBottom: 'clamp(28px,3.2vw,40px)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF6A1A', marginBottom: '10px' }}>
              Shop by category
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(32px,3.8vw,44px)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.05, color: '#1A1D23' }}>
              Find the right tyre for your drive
            </h2>
          </div>
          <Link
            href="/tyres"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', color: '#2A2E36', textDecoration: 'none',
              whiteSpace: 'nowrap', paddingBottom: '4px',
            }}
          >
            View all tyres
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div data-reveal className="nv-cat-grid nv-d1">
          {CATEGORIES.map(c => (
            <Link key={c.key} href={c.href} className="nv-cat-card" data-category={c.key}>
              <span className="nv-cat-figure">
                <Image src={c.img} alt={c.alt} width={c.w} height={c.h} className="nv-cat-img" />
              </span>
              <span style={{ display: 'block', fontSize: '19px', fontWeight: 700, color: '#1A1D23', marginBottom: '6px' }}>
                {c.name}
              </span>
              <span style={{ display: 'block', fontSize: '13.5px', color: '#6B7280' }}>
                {c.blurb}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
