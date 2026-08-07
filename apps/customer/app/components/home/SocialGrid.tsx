import Image from 'next/image'

const SOCIAL_LINKS = [
  { label: 'Facebook',  href: 'https://facebook.com/Novatyres.Official' },
  { label: 'Instagram', href: 'https://instagram.com/novatyres' },
  { label: 'TikTok',    href: 'https://tiktok.com/@novatyres' },
]

const PICS = [
  { tag: 'IG', href: 'https://instagram.com/novatyres',      src: '/images/social/social-1.jpg', alt: 'Customer car on the open road' },
  { tag: 'IG', href: 'https://instagram.com/novatyres',      src: '/images/social/social-2.jpg', alt: 'Fresh set of wheels in the bay' },
  { tag: 'FB', href: 'https://facebook.com/Novatyres.Official', src: '/images/social/social-3.jpg', alt: 'A Nova Tyres fit-out' },
  { tag: 'IG', href: 'https://instagram.com/novatyres',      src: '/images/social/social-4.jpg', alt: 'Front end of a customer car' },
  { tag: 'TT', href: 'https://tiktok.com/@novatyres',        src: '/images/social/social-5.jpg', alt: 'A customer ride tagged #NovaTyres' },
  { tag: 'IG', href: 'https://instagram.com/novatyres',      src: '/images/social/social-6.jpg', alt: 'Another #NovaTyres tag from the road' },
]

export default function SocialGrid() {
  return (
    <section style={{ background: '#FFFFFF', borderTop: '1px solid #E7E5DE', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .nv-social-grid { display: grid; gap: 0; grid-template-columns: repeat(6,minmax(0,1fr)); }
        @media (max-width: 1100px) { .nv-social-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        @media (max-width: 780px)  { .nv-social-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        .nv-social-tile img { transition: transform .55s cubic-bezier(.22,1,.36,1); }
        .nv-social-tile:hover img { transform: scale(1.06); }
        .nv-social-link { font-size: 14.5px; font-weight: 700; color: #076330; text-decoration: none; border-bottom: 1.5px solid transparent; padding-bottom: 2px; transition: border-color .2s; }
        .nv-social-link:hover { border-color: #076330; }
      `}</style>

      <div
        style={{
          maxWidth: '1180px', margin: '0 auto',
          padding: 'clamp(34px,4vw,52px) clamp(16px,4vw,40px)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px 24px',
        }}
      >
        <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(30px,3.8vw,46px)', letterSpacing: '0.015em', lineHeight: 1, color: '#16211B' }}>
          <span style={{ color: '#E8572A' }}>#NovaTyres</span> in Social Media
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,2.4vw,28px)' }}>
          {SOCIAL_LINKS.map(sl => (
            <a key={sl.label} href={sl.href} target="_blank" rel="noopener noreferrer" className="nv-social-link">
              {sl.label}
            </a>
          ))}
        </div>
      </div>

      <div className="nv-social-grid">
        {PICS.map((sp, i) => (
          <a
            key={i}
            href={sp.href} target="_blank" rel="noopener noreferrer"
            aria-label={sp.alt}
            className="nv-social-tile"
            style={{ position: 'relative', display: 'block', aspectRatio: '1', overflow: 'hidden', background: '#12241A' }}
          >
            <Image src={sp.src} alt={sp.alt} fill sizes="(max-width: 780px) 50vw, (max-width: 1100px) 33vw, 16vw" style={{ objectFit: 'cover' }} />
            <span style={{
              position: 'absolute', top: '10px', right: '10px', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', minWidth: '24px', height: '24px',
              padding: '0 7px', borderRadius: '6px', background: 'rgba(13,26,18,0.72)', color: '#F1EFE7',
              fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.06em',
            }}>
              {sp.tag}
            </span>
            <span style={{
              position: 'absolute', left: '50%', bottom: '12px', transform: 'translateX(-50%)',
              display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF',
              color: '#0F2A1C', borderRadius: '999px', padding: '5px 11px',
              fontFamily: "'DM Mono', monospace", fontSize: '9.5px', letterSpacing: '0.12em',
              textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 6px 16px -10px rgba(0,0,0,0.6)',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#076330" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l2-5.2A8.4 8.4 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5Z" />
              </svg>
              DM for price
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
