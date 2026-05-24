import Link from 'next/link'

const categories = [
  {
    title: 'All Terrain Tyre',
    subtitle: 'Versatile performance. On and off the road.',
    href: '/tyres?type=MUD_TERRAIN',
    image: '/images/categories/all-terrain.jpg',
    color: '#2D4A35'
  },
  {
    title: '4×4 Tyre',
    subtitle: 'Built for power. Ready for anything.',
    href: '/tyres?type=SUV',
    image: '/images/categories/4x4.jpg',
    color: '#1C3A2B'
  },
  {
    title: 'Passenger Tyre',
    subtitle: 'Smooth, quiet and reliable for everyday driving.',
    href: '/tyres?type=PASSENGER',
    image: '/images/categories/passenger.jpg',
    color: '#2A3F35'
  },
  {
    title: 'Mud Terrain Tyre',
    subtitle: 'Maximum traction. Conquer the mud.',
    href: '/tyres?type=MUD_TERRAIN',
    image: '/images/categories/mud-terrain.jpg',
    color: '#1A2E22'
  },
]

export default function BrowseByCategory() {
  return (
    <section className="py-12 px-4" style={{ background: '#FAF9F5' }}>
      <div className="max-w-7xl mx-auto">

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p
              className="uppercase tracking-widest mb-1"
              style={{ color: '#E8572A', letterSpacing: '0.12em', fontSize: '12px', fontWeight: 500 }}
            >
              Browse by Category
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: '#1A1A1A', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em', lineHeight: 1.1 }}>
              Find the Right<br />Tyre for Your Drive
            </h2>
            <p className="mt-3" style={{ color: '#666', maxWidth: '320px', lineHeight: '1.6', fontSize: '15px', fontWeight: 400 }}>
              From everyday drives to off-road adventures, explore tyres engineered for performance, safety and confidence.
            </p>
            <Link
              href="/tyres"
              className="inline-flex items-center gap-2 mt-4 border rounded-full px-4 py-2 transition-all hover:bg-gray-50"
              style={{ borderColor: '#1A1A1A', color: '#1A1A1A', fontSize: '14px', fontWeight: 600 }}
            >
              Explore All Tyres
              <i className="ti ti-arrow-up-right" style={{ fontSize: '14px' }} aria-hidden="true" />
            </Link>
          </div>

          {/* Premium card */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: '#1C3A2B', minWidth: '220px', maxWidth: '260px' }}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(232,87,42,0.2)' }}
                >
                  <i className="ti ti-bolt" style={{ fontSize: '16px', color: '#E8572A' }} aria-hidden="true" />
                </div>
              </div>
              <p className="text-white mb-1" style={{ fontSize: '18px', fontWeight: 500 }}>Premium Tyres</p>
              <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 500 }}>
                Exceptional performance. Maximum safety. Engineered for excellence.
              </p>
            </div>
            <Link
              href="/tyres?type=premium"
              className="inline-flex items-center gap-2 mt-4 uppercase tracking-wide transition-opacity hover:opacity-80"
              style={{ color: '#E8572A', letterSpacing: '0.1em', fontSize: '12px', fontWeight: 500 }}
            >
              Explore Premium
              <i className="ti ti-arrow-right" style={{ fontSize: '14px' }} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.title}
              href={cat.href}
              className="relative rounded-2xl overflow-hidden group"
              style={{ aspectRatio: '3/4', minHeight: '200px', background: cat.color }}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
              />

              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)' }}
              />

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white mb-1" style={{ fontSize: '18px', fontWeight: 500 }}>{cat.title}</p>
                <p className="leading-snug" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500 }}>{cat.subtitle}</p>
              </div>

              <div
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: '#E8572A' }}
              >
                <i className="ti ti-arrow-up-right" style={{ fontSize: '14px', color: 'white' }} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
