const reviews = [
  {
    name: 'Sarah M.',
    location: 'Melbourne',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: true,
  },
  {
    name: 'Sarah M.',
    location: 'Springvale',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: false,
  },
  {
    name: 'Sarah M.',
    location: 'Bayswater',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: false,
  },
  {
    name: 'Sarah M.',
    location: 'Sefton',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: false,
  },
  {
    name: 'Sarah M.',
    location: 'Dandenong',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: false,
  },
]

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <i key={i} className="ti ti-star-filled" style={{ fontSize: '14px', color: '#F5A623' }} aria-hidden="true" />
    ))}
  </div>
)

/* Google multicolour G logo */
const GoogleG = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
)

export default function CustomerReviews() {
  const featured = reviews.find(r => r.featured)!
  const regular  = reviews.filter(r => !r.featured)

  return (
    <section className="py-16 px-4" style={{ background: '#FAF9F5' }}>
      <div style={{ maxWidth: '96%', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <p
              className="uppercase tracking-widest mb-1"
              style={{ color: '#E8572A', letterSpacing: '0.12em', fontSize: '12px', fontWeight: 500 }}
            >
              Customer Reviews
            </p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', color: '#1A1A1A', letterSpacing: '0.02em', lineHeight: 1.1 }}>
              Rated <span style={{ color: '#E8572A' }}>4.8</span> ★
            </h2>
            <p className="mt-1" style={{ color: '#666', fontSize: '15px', fontWeight: 400 }}>by 1,240+ Drivers.</p>
          </div>

          {/* Google rating badge */}
          <div
            className="flex items-center gap-3 border rounded-xl px-4 py-3"
            style={{ borderColor: '#E5E5E5', background: 'white' }}
          >
            <p style={{ color: '#1A1A1A', fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>4.8</p>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <GoogleG size={18} />
                <Stars count={5} />
              </div>
              <p style={{ color: '#888', fontSize: '12px', fontWeight: 500 }}>1,240 Verified</p>
              <p style={{ color: '#888', fontSize: '12px', fontWeight: 500 }}>Google Reviews</p>
            </div>
          </div>
        </div>

        {/* ── Layout: large featured left + 2×2 grid right ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Featured card — col-span-4 */}
          <div
            className="md:col-span-4 rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: '#1C3A2B', minHeight: '300px' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <Stars count={featured.rating} />
                <GoogleG size={22} />
              </div>
              <p className="leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.88)', fontSize: '15px', fontWeight: 400 }}>
                &ldquo;{featured.text}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px' }}
              >
                {featured.name[0]}
              </div>
              <div>
                <p className="text-white" style={{ fontSize: '15px', fontWeight: 500 }}>{featured.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
                  <i className="ti ti-map-pin" style={{ fontSize: '10px' }} aria-hidden="true" /> {featured.location}
                </p>
              </div>
            </div>
          </div>

          {/* Regular cards — col-span-8, 2×2 grid */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {regular.map((review, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 border flex flex-col justify-between"
                style={{ background: 'white', borderColor: '#E5E5E5' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Stars count={review.rating} />
                    <GoogleG size={20} />
                  </div>
                  <p className="leading-relaxed italic" style={{ color: '#444', fontSize: '14px', fontWeight: 400 }}>
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{ background: '#F0F0F0', color: '#555', fontSize: '12px' }}
                  >
                    {review.name[0]}
                  </div>
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: '14px', fontWeight: 500 }}>{review.name}</p>
                    <p style={{ color: '#888', fontSize: '11px', fontWeight: 500 }}>
                      <i className="ti ti-map-pin" style={{ fontSize: '10px' }} aria-hidden="true" /> {review.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
