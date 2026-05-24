const reviews = [
  {
    name: 'Sarah M.',
    location: 'Springvale',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: true
  },
  {
    name: 'Sarah M.',
    location: 'Bayswater',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: false
  },
  {
    name: 'Sarah M.',
    location: 'Sefton',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: false
  },
  {
    name: 'Sarah M.',
    location: 'Dandenong',
    text: 'Best prices in Melbourne, hands down. Got 4 Maxxis AT tyres fitted at Springvale — quick, professional, and way cheaper than anywhere else I quoted.',
    rating: 5,
    featured: false
  },
]

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <i key={i} className="ti ti-star-filled" style={{ fontSize: '14px', color: '#F5A623' }} aria-hidden="true" />
    ))}
  </div>
)

export default function CustomerReviews() {
  return (
    <section className="py-16 px-4" style={{ background: '#FAF9F5' }}>
      <div className="max-w-7xl mx-auto">

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

          <div
            className="flex items-center gap-3 border rounded-xl px-4 py-3"
            style={{ borderColor: '#E5E5E5', background: 'white' }}
          >
            <p className="font-bold text-3xl" style={{ color: '#1A1A1A' }}>4.8</p>
            <div>
              <Stars count={5} />
              <p className="mt-0.5" style={{ color: '#888', fontSize: '12px', fontWeight: 500 }}>1,240 Verified</p>
              <p style={{ color: '#888', fontSize: '12px', fontWeight: 500 }}>Google Reviews</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Featured review */}
          <div
            className="md:col-span-4 rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: '#1C3A2B', minHeight: '260px' }}
          >
            <div>
              <Stars count={5} />
              <p className="text-white mt-4 leading-relaxed italic" style={{ fontSize: '15px', fontWeight: 400 }}>
                &ldquo;{reviews[0]?.text}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: '#E8572A', fontSize: '12px' }}
              >
                {reviews[0]?.name[0]}
              </div>
              <div>
                <p className="text-white" style={{ fontSize: '15px', fontWeight: 500 }}>{reviews[0]?.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
                  <i className="ti ti-map-pin" style={{ fontSize: '11px' }} aria-hidden="true" /> {reviews[0]?.location}
                </p>
              </div>
            </div>
          </div>

          {/* Other reviews */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.slice(1).map((review, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 border"
                style={{ background: 'white', borderColor: '#E5E5E5' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <Stars count={review.rating} />
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#4285F4' }}
                  >
                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 700 }}>G</span>
                  </div>
                </div>
                <p className="leading-relaxed italic mb-4" style={{ color: '#444', fontSize: '15px', fontWeight: 400 }}>
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: '#1C3A2B', fontSize: '12px' }}
                  >
                    {review.name[0]}
                  </div>
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: '15px', fontWeight: 500 }}>{review.name}</p>
                    <p style={{ color: '#888', fontSize: '12px', fontWeight: 500 }}>
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
