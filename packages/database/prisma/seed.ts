import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaClient, TyreType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const STORES = [
  { name: 'Nova Tyres Alphington',  slug: 'alphington',  address: '200 Grange Rd',       suburb: 'Alphington',    state: 'VIC', postcode: '3078', phone: '03 7009 7700', email: 'alphington@novatyres.com.au',  lat: -37.7787, lon: 145.0204 },
  { name: 'Nova Tyres Springvale',  slug: 'springvale',  address: '4/134 Springvale Rd', suburb: 'Springvale',    state: 'VIC', postcode: '3171', phone: '03 9562 4269', email: 'springvale@novatyres.com.au',  lat: -37.9519, lon: 145.1523 },
  { name: 'Nova Tyres Sefton',      slug: 'sefton',      address: '107 Carlingford St',  suburb: 'Sefton',        state: 'NSW', postcode: '2162', phone: '02 9644 0000', email: 'sefton@novatyres.com.au',      lat: -33.8918, lon: 151.0249 },
  { name: 'Nova Tyres Dandenong',   slug: 'dandenong',   address: '308 S Gippsland Hwy', suburb: 'Dandenong',     state: 'VIC', postcode: '3175', phone: '03 8787 5846', email: 'dandenong@novatyres.com.au',   lat: -38.0026, lon: 145.2167 },
  { name: 'Nova Tyres Bayswater',   slug: 'bayswater',   address: '194 Canterbury Rd',   suburb: 'Bayswater',     state: 'VIC', postcode: '3153', phone: '03 9720 9354', email: 'bayswater@novatyres.com.au',   lat: -37.8465, lon: 145.2683 },
  { name: 'Nova Tyres Sunshine',    slug: 'sunshine',    address: '9 Devonshire Rd',     suburb: 'Sunshine',      state: 'VIC', postcode: '3020', phone: '03 9311 0000', email: 'sunshine@novatyres.com.au',    lat: -37.7893, lon: 144.8337 },
  { name: 'Nova Tyres Geelong',     slug: 'geelong',     address: '1/118 Bellarine Hwy', suburb: 'Newcomb',       state: 'VIC', postcode: '3219', phone: '03 5221 0000', email: 'geelong@novatyres.com.au',     lat: -38.1510, lon: 144.3933 },
  { name: 'Nova Tyres Brisbane',    slug: 'brisbane',    address: '123 Ipswich Rd',      suburb: 'Woolloongabba', state: 'QLD', postcode: '4102', phone: '07 3276 0000', email: 'brisbane@novatyres.com.au',    lat: -27.4975, lon: 153.0257 },
  { name: 'Nova Tyres Adelaide',    slug: 'adelaide',    address: '456 Port Rd',         suburb: 'Hindmarsh',     state: 'SA',  postcode: '5007', phone: '08 8346 0000', email: 'adelaide@novatyres.com.au',    lat: -34.9001, lon: 138.5784 },
]

const STORE_HOURS = [
  { day: 'Monday',    openTime: '08:00', closeTime: '17:30', isClosed: false },
  { day: 'Tuesday',   openTime: '08:00', closeTime: '17:30', isClosed: false },
  { day: 'Wednesday', openTime: '08:00', closeTime: '17:30', isClosed: false },
  { day: 'Thursday',  openTime: '08:00', closeTime: '17:30', isClosed: false },
  { day: 'Friday',    openTime: '08:00', closeTime: '17:30', isClosed: false },
  { day: 'Saturday',  openTime: '08:00', closeTime: '16:00', isClosed: false },
  { day: 'Sunday',    openTime: '00:00', closeTime: '00:00', isClosed: true  },
]

const SERVICES = [
  { name: 'Free Pre-RWC Check',     description: 'Comprehensive pre-roadworthy certificate inspection to identify any issues before your official RWC test. Includes brakes, tyres, lights, steering and suspension.',         priceFrom: 0,   durationMinutes: 45  },
  { name: 'Free Safety Inspection', description: 'A thorough safety check of your vehicle covering tyres, brakes, lights, steering and fluid levels at no cost to you.',                                                       priceFrom: 0,   durationMinutes: 30  },
  { name: 'Log Book Service',       description: "Full manufacturer-scheduled log book service to keep your new car warranty intact and your vehicle running at peak performance.",                                             priceFrom: 149, durationMinutes: 90  },
  { name: 'Yearly Services',        description: 'Annual vehicle service covering oil and filter change, fluid top-ups, tyre rotation, brake inspection and a comprehensive safety check.',                                     priceFrom: 199, durationMinutes: 120 },
  { name: '3 Year Services',        description: 'Comprehensive 3-year service including all standard items plus coolant flush, brake fluid change, spark plug replacement and a full mechanical inspection.',                  priceFrom: 299, durationMinutes: 180 },
  { name: '6 Year Service',         description: 'Full 6-year major service covering timing belt/chain inspection, fuel system service, all fluid replacements and an in-depth mechanical and electrical health check.',        priceFrom: 449, durationMinutes: 240 },
  { name: 'Ultimate Service',       description: 'Our most comprehensive service package covering every mechanical and safety aspect of your vehicle — including all fluids, filters, belts, brakes and a full safety report.', priceFrom: 599, durationMinutes: 300 },
]

const TYRE_SIZES = [
  { width: 245, profile: 70, rimDiameter: 16, loadIndex: 118, speedRating: 'S', construction: 'R' },
  { width: 215, profile: 65, rimDiameter: 16, loadIndex: 98,  speedRating: 'H', construction: 'R' },
  { width: 245, profile: 45, rimDiameter: 18, loadIndex: 100, speedRating: 'Y', construction: 'R' },
  { width: 225, profile: 40, rimDiameter: 18, loadIndex: 92,  speedRating: 'Y', construction: 'R' },
  { width: 205, profile: 55, rimDiameter: 16, loadIndex: 91,  speedRating: 'V', construction: 'R' },
  { width: 225, profile: 50, rimDiameter: 17, loadIndex: 98,  speedRating: 'W', construction: 'R' },
  { width: 265, profile: 70, rimDiameter: 16, loadIndex: 112, speedRating: 'H', construction: 'R' },
  { width: 275, profile: 55, rimDiameter: 20, loadIndex: 117, speedRating: 'H', construction: 'R' },
]

// Image mapped by tyre type
const TYRE_TYPE_IMAGE: Record<string, string> = {
  PASSENGER:   '/images/tyres/tyre-passenger.png',
  SUV:         '/images/tyres/tyre-suv.png',
  MUD_TERRAIN: '/images/tyres/tyre-mud.png',
  COMMERCIAL:  '/images/tyres/tyre-4x4.png',
}

const TYRES = [
  {
    brand: 'Continental', model: 'CrossContact A/T',
    slug: 'continental-crosscontact-at-245-70r16',
    type: TyreType.SUV, sizeIdx: 0, price: 91.50,
    isBestSeller: true, isFeatured: true,
    description: 'The CrossContact A/T combines on-road comfort with proven off-road capability. Ideal for SUVs and 4WDs that need reliable all-terrain performance year-round.',
  },
  {
    brand: 'Hankook', model: 'Ventus S1 evo3',
    slug: 'hankook-ventus-s1-evo3-215-65r16',
    type: TyreType.PASSENGER, sizeIdx: 1, price: 120.50,
    isBestSeller: false, isFeatured: true,
    description: 'The Ventus S1 evo3 delivers outstanding dry and wet handling for sporty passenger vehicles. High-speed stability meets responsive, precise steering feel.',
  },
  {
    brand: 'Continental', model: 'UltraContact UX7',
    slug: 'continental-ultracontact-ux7-215-65r16',
    type: TyreType.PASSENGER, sizeIdx: 1, price: 100.00,
    isBestSeller: true, isFeatured: false,
    description: "Continental's advanced touring tyre offering exceptional comfort, fuel efficiency and all-weather safety — engineered for everyday drivers who demand more.",
  },
  {
    brand: 'Pirelli', model: 'P Zero Sport',
    slug: 'pirelli-p-zero-sport-245-45r18',
    type: TyreType.PASSENGER, sizeIdx: 2, price: 185.00,
    isBestSeller: false, isFeatured: true,
    description: "Pirelli's flagship ultra-high-performance tyre. Track-derived technology delivers maximum dry grip and precise handling for performance and luxury vehicles.",
  },
  {
    brand: 'Maxxis', model: 'Victra Sport 5',
    slug: 'maxxis-victra-sport-5-225-40r18',
    type: TyreType.PASSENGER, sizeIdx: 3, price: 145.00,
    isBestSeller: true, isFeatured: false,
    description: 'The Victra Sport 5 provides high performance at a competitive price. Optimised for sports and performance vehicles with excellent handling in wet and dry conditions.',
  },
  {
    brand: 'Hankook', model: 'Kinergy Eco 2',
    slug: 'hankook-kinergy-eco2-205-55r16',
    type: TyreType.PASSENGER, sizeIdx: 4, price: 98.00,
    isBestSeller: false, isFeatured: false,
    description: 'The Kinergy Eco 2 prioritises fuel efficiency and all-season safety. Perfect for everyday commuters seeking economy without compromising ride comfort or wet traction.',
  },
  {
    brand: 'Pirelli', model: 'Cinturato P7',
    slug: 'pirelli-cinturato-p7-225-50r17',
    type: TyreType.PASSENGER, sizeIdx: 5, price: 160.00,
    isBestSeller: false, isFeatured: false,
    description: "Pirelli's green performance tyre combining efficiency and safety with low rolling resistance. Engineered for premium vehicles that demand comfort and environmental responsibility.",
  },
  {
    brand: 'Yokohama', model: 'Geolandar A/T',
    slug: 'yokohama-geolandar-at-265-70r16',
    type: TyreType.MUD_TERRAIN, sizeIdx: 6, price: 199.00,
    isBestSeller: true, isFeatured: true,
    description: "Australia's trusted all-terrain tyre for 4WDs and SUVs. Aggressive shoulder blocks deliver confident off-road grip while maintaining quiet, comfortable highway manners.",
  },
  {
    brand: 'BF Goodrich', model: 'Mud Terrain T/A',
    slug: 'bfgoodrich-mud-terrain-ta-275-55r20',
    type: TyreType.MUD_TERRAIN, sizeIdx: 7, price: 329.00,
    isBestSeller: false, isFeatured: true,
    description: 'Legendary mud terrain tyre engineered for maximum off-road traction in the toughest conditions. Massive tread lugs self-clean in deep mud, rocks and loose terrain.',
  },
]

const WHEELS = [
  {
    brand: 'Black Rhino', model: 'AWOL',    slug: 'black-rhino-awol-17x85',
    diameter: 17, width: 8.5, pcd: '6×139.7', offset: -18, finish: 'Matte Black',  price: 230.00,
    description: 'Premium off-road alloy wheel built for serious 4WD performance. Deep dish design with aggressive styling and high load rating for heavy-duty applications.',
  },
  {
    brand: 'Black Rhino', model: 'Arsenal', slug: 'black-rhino-arsenal-18x9',
    diameter: 18, width: 9.0, pcd: '5×114.3', offset: 12,  finish: 'Bronze',       price: 265.00,
    description: 'Military-grade durability meets refined aesthetics. Multi-spoke design in striking bronze pairs perfectly with lifted SUVs and dual-cab utes.',
  },
  {
    brand: 'ROH', model: 'Terrain',         slug: 'roh-terrain-16x8',
    diameter: 16, width: 8.0, pcd: '6×139.7', offset: -10, finish: 'Gunmetal',     price: 195.00,
    description: "Australia's trusted off-road wheel. The ROH Terrain is engineered for tough conditions with a proven track record across all terrains — mud, rock and everything in between.",
  },
  {
    brand: 'ROH', model: 'Warrior',         slug: 'roh-warrior-20x9',
    diameter: 20, width: 9.0, pcd: '5×150',   offset: 18,  finish: 'Satin Black',  price: 295.00,
    description: 'Combines aggressive styling with everyday usability. Large diameter options for lifted trucks and SUVs that need presence without sacrificing practicality.',
  },
  {
    brand: 'King Wheels', model: 'Force',   slug: 'king-force-17x8',
    diameter: 17, width: 8.0, pcd: '6×139.7', offset: -10, finish: 'Gloss Black',  price: 185.00,
    description: 'Value-packed alloy wheel offering great looks at an accessible price. The King Force is the perfect upgrade for 4WDs and utes seeking style and strength.',
  },
  {
    brand: 'Sonix', model: 'XR7',           slug: 'sonix-xr7-18x85',
    diameter: 18, width: 8.5, pcd: '5×112',   offset: 35,  finish: 'Hyper Silver', price: 175.00,
    description: 'European styling at an Australian price. The XR7 features a refined multi-spoke design in hyper silver that complements European and Japanese passenger vehicles.',
  },
]

// Weekday and Saturday appointment time slots
const WEEKDAY_SLOTS = ['08:30', '09:30', '10:30', '11:30', '13:00', '14:00', '15:00', '16:00']
const SATURDAY_SLOTS = ['08:30', '09:30', '10:30', '11:30', '13:00', '14:00']

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting database seed...\n')

  // ── Super Admin ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123456', 12)
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@novatyres.com.au' },
    update: {},
    create: { firstName: 'Nova', lastName: 'Admin', email: 'admin@novatyres.com.au', passwordHash, role: 'SUPER_ADMIN', isActive: true },
  })
  console.log('✅ Super Admin:', superAdmin.email)

  // ── Stores ──────────────────────────────────────────────────────────────────
  const storeIdMap: Record<string, string> = {}
  for (const s of STORES) {
    const store = await prisma.store.upsert({
      where: { slug: s.slug },
      update: { name: s.name, address: s.address, suburb: s.suburb, state: s.state, postcode: s.postcode, phone: s.phone, email: s.email, latitude: s.lat, longitude: s.lon },
      create: { name: s.name, slug: s.slug, address: s.address, suburb: s.suburb, state: s.state, postcode: s.postcode, phone: s.phone, email: s.email, latitude: s.lat, longitude: s.lon, isActive: true },
    })
    storeIdMap[s.slug] = store.id
  }
  console.log(`✅ ${STORES.length} stores seeded`)

  // ── Store Hours ─────────────────────────────────────────────────────────────
  for (const storeId of Object.values(storeIdMap)) {
    for (const h of STORE_HOURS) {
      await prisma.storeHours.upsert({
        where: { storeId_dayOfWeek: { storeId, dayOfWeek: h.day } },
        update: { openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed },
        create: { storeId, dayOfWeek: h.day, openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed },
      })
    }
  }
  console.log(`✅ Store hours seeded (${STORES.length} stores × ${STORE_HOURS.length} days)`)

  // ── Services ────────────────────────────────────────────────────────────────
  const serviceIds: string[] = []
  for (const svc of SERVICES) {
    const existing = await prisma.service.findFirst({ where: { name: svc.name } })
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data: { description: svc.description, priceFrom: svc.priceFrom, durationMinutes: svc.durationMinutes } })
      serviceIds.push(existing.id)
    } else {
      const created = await prisma.service.create({ data: { ...svc, isActive: true } })
      serviceIds.push(created.id)
    }
  }
  console.log(`✅ ${SERVICES.length} services seeded`)

  // ── Store Services (all services available at all stores) ───────────────────
  for (const storeId of Object.values(storeIdMap)) {
    for (const serviceId of serviceIds) {
      await prisma.storeService.upsert({
        where: { storeId_serviceId: { storeId, serviceId } },
        update: { isAvailable: true },
        create: { storeId, serviceId, isAvailable: true },
      })
    }
  }
  console.log(`✅ Store services linked`)

  // ── Appointment Slots (next 60 days) ────────────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const slotRows: { storeId: string; date: Date; time: string; isAvailable: boolean; maxBookings: number; currentBookings: number }[] = []

  for (const storeId of Object.values(storeIdMap)) {
    for (let d = 0; d < 60; d++) {
      const date = new Date(today)
      date.setDate(today.getDate() + d)
      const dow = date.getDay() // 0=Sun, 6=Sat
      if (dow === 0) continue   // closed Sundays

      const times = dow === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS
      for (const time of times) {
        slotRows.push({ storeId, date, time, isAvailable: true, maxBookings: 2, currentBookings: 0 })
      }
    }
  }

  await prisma.appointmentSlot.createMany({ data: slotRows, skipDuplicates: true })
  console.log(`✅ ${slotRows.length} appointment slots seeded`)

  // ── Tyre Sizes ──────────────────────────────────────────────────────────────
  const sizeIds: string[] = []
  for (const ts of TYRE_SIZES) {
    const size = await prisma.tyreSize.upsert({
      where: { width_profile_rimDiameter: { width: ts.width, profile: ts.profile, rimDiameter: ts.rimDiameter } },
      update: {},
      create: ts,
    })
    sizeIds.push(size.id)
  }
  console.log(`✅ ${TYRE_SIZES.length} tyre sizes seeded`)

  // ── Tyres ───────────────────────────────────────────────────────────────────
  for (const t of TYRES) {
    const tyre = await prisma.tyre.upsert({
      where: { slug: t.slug },
      update: { description: t.description, price: t.price, isBestSeller: t.isBestSeller, isFeatured: t.isFeatured },
      create: {
        brand: t.brand, model: t.model, description: t.description, slug: t.slug,
        type: t.type, tyreSizeId: sizeIds[t.sizeIdx], price: t.price,
        compareAtPrice: parseFloat((t.price * 1.2).toFixed(2)),
        stockQuantity: Math.floor(Math.random() * 30) + 10,
        isBestSeller: t.isBestSeller, isFeatured: t.isFeatured, isActive: true,
      },
    })
    const imageCount = await prisma.tyreImage.count({ where: { tyreId: tyre.id } })
    if (imageCount === 0) {
      await prisma.tyreImage.create({
        data: { tyreId: tyre.id, url: TYRE_TYPE_IMAGE[t.type], altText: `${t.brand} ${t.model}`, sortOrder: 0 },
      })
    }
    console.log(`  → ${t.brand} ${t.model}`)
  }
  console.log('✅ Tyres seeded')

  // ── Wheels ──────────────────────────────────────────────────────────────────
  for (const w of WHEELS) {
    const wheel = await prisma.wheel.upsert({
      where: { slug: w.slug },
      update: { description: w.description, price: w.price },
      create: {
        brand: w.brand, model: w.model, description: w.description, slug: w.slug,
        diameter: w.diameter, width: w.width, pcd: w.pcd, offset: w.offset,
        material: 'Alloy', finish: w.finish, price: w.price,
        compareAtPrice: parseFloat((w.price * 1.2).toFixed(2)),
        stockQuantity: Math.floor(Math.random() * 16) + 4, isActive: true,
      },
    })
    const imageCount = await prisma.wheelImage.count({ where: { wheelId: wheel.id } })
    if (imageCount === 0) {
      await prisma.wheelImage.create({
        data: { wheelId: wheel.id, url: '/images/wheel/Wheel 1.png', altText: `${w.brand} ${w.model}`, sortOrder: 0 },
      })
    }
    console.log(`  → ${w.brand} ${w.model}`)
  }
  console.log('✅ Wheels seeded')

  // ── Store Manager Admin Users ────────────────────────────────────────────────
  const managerPassword = await bcrypt.hash('manager123456', 12)
  const MANAGERS = [
    { first: 'Daniel',  last: 'Mercer',  email: 'daniel.m@novatyres.com.au',  slug: 'springvale' },
    { first: 'Sophie',  last: 'Kaur',    email: 'sophie.k@novatyres.com.au',  slug: 'dandenong'  },
    { first: 'Raj',     last: 'Thakur',  email: 'raj.t@novatyres.com.au',     slug: 'bayswater'  },
    { first: 'Lauren',  last: 'Nguyen',  email: 'lauren.n@novatyres.com.au',  slug: 'alphington' },
    { first: 'Priya',   last: 'Sharma',  email: 'priya.s@novatyres.com.au',   slug: 'sefton'     },
    { first: 'Marco',   last: 'Vella',   email: 'marco.v@novatyres.com.au',   slug: 'sunshine'   },
  ]
  for (const m of MANAGERS) {
    const storeId = storeIdMap[m.slug]
    if (!storeId) continue
    await prisma.adminUser.upsert({
      where: { email: m.email },
      update: { storeId },
      create: { firstName: m.first, lastName: m.last, email: m.email, passwordHash: managerPassword, role: 'STORE_MANAGER', storeId, isActive: true },
    })
  }
  console.log(`✅ ${MANAGERS.length} store managers seeded`)

  // ── Reviews (uses real customer IDs from customer app) ───────────────────────
  const CUSTOMER_IDS = [
    '1468ff72-70de-4d4f-a0b1-67009914bd29',
    '4e316087-25b8-441d-9af0-d068f206b8fb',
    '97ea8174-be73-43d0-ab53-594bb6676ab6',
  ]
  const REVIEWS_DATA = [
    { store: 'springvale', rating: 5, title: 'Excellent service', body: 'Same-day log book service, warranty stamp and all — no upsell. Honest and fast.' },
    { store: 'dandenong',  rating: 5, title: 'Very helpful',      body: 'Free pre-RWC check saved me a fortune. Helpful crew who explained everything clearly.' },
    { store: 'bayswater',  rating: 5, title: 'Drives like new',   body: 'Ultimate Service and it drives like new. Call-back within the hour as promised.' },
    { store: 'alphington', rating: 4, title: 'Fast turnaround',   body: 'Friendly, fast, fair priced. Dropped before work, ready by lunch.' },
    { store: 'sunshine',   rating: 5, title: 'No hidden costs',   body: 'Sorted my brakes same day and were clear about costs upfront. No surprises.' },
    { store: 'sefton',     rating: 3, title: 'Good work',         body: 'Good work but waited a little longer than quoted. Staff were apologetic.' },
    { store: 'springvale', rating: 5, title: 'Best prices',       body: 'Best tyre prices in Melbourne. Had 4 Maxxis fitted quickly — professional service.' },
    { store: 'dandenong',  rating: 4, title: 'Quality job',       body: 'Brake replacement done well. Slightly longer wait but quality work.' },
    { store: 'bayswater',  rating: 5, title: 'Seamless experience', body: 'Entire service experience was seamless. Will return for next service.' },
    { store: 'sefton',     rating: 5, title: 'Great communication', body: 'Tyres arrived and fitted perfectly. Great communication throughout.' },
  ]
  const reviewBase = new Date()
  reviewBase.setDate(reviewBase.getDate() - 30)
  const existingCustomers = await prisma.customer.findMany({ select: { id: true } })
  const customerIds = existingCustomers.length > 0
    ? existingCustomers.map(c => c.id)
    : CUSTOMER_IDS
  for (let i = 0; i < REVIEWS_DATA.length; i++) {
    const r = REVIEWS_DATA[i]
    const storeId = storeIdMap[r.store]
    const customerId = customerIds[i % customerIds.length]
    if (!storeId || !customerId) continue
    const createdAt = new Date(reviewBase.getTime() + i * 3 * 24 * 60 * 60 * 1000)
    await prisma.review.upsert({
      where: { id: `review-seed-${i}` },
      update: {},
      create: {
        id: `review-seed-${i}`,
        customerId, storeId, rating: r.rating,
        title: r.title, body: r.body,
        isVerifiedPurchase: true, isApproved: true, createdAt,
      },
    })
  }
  console.log(`✅ ${REVIEWS_DATA.length} reviews seeded`)

  // ── Appointments (uses real customer IDs + appointment slots) ────────────────
  const now = new Date()
  const slots = await prisma.appointmentSlot.findMany({
    where: { isAvailable: true },
    orderBy: { date: 'asc' },
    take: 20,
  })
  const allServices = await prisma.service.findMany()
  const APPT_DATA = [
    { customer: 0, slot: 0, service: 2, status: 'PENDING',   vehicle: '2021 Toyota RAV4' },
    { customer: 1, slot: 1, service: 0, status: 'PENDING',   vehicle: '2019 Mazda 3' },
    { customer: 2, slot: 2, service: 3, status: 'CONFIRMED', vehicle: '2022 Ford Ranger' },
    { customer: 0, slot: 3, service: 2, status: 'CONFIRMED', vehicle: '2020 VW Golf' },
    { customer: 1, slot: 4, service: 6, status: 'COMPLETED', vehicle: '2018 Subaru WRX' },
    { customer: 2, slot: 5, service: 2, status: 'CONFIRMED', vehicle: '2023 Tesla Model 3' },
    { customer: 0, slot: 6, service: 4, status: 'COMPLETED', vehicle: '2017 Hyundai i30' },
    { customer: 1, slot: 7, service: 2, status: 'COMPLETED', vehicle: '2021 Kia Sportage' },
  ]
  for (let i = 0; i < APPT_DATA.length; i++) {
    const a = APPT_DATA[i]
    const slot = slots[a.slot % slots.length]
    const service = allServices[a.service % allServices.length]
    const customerId = customerIds[a.customer % customerIds.length]
    if (!slot || !service || !customerId) continue
    await prisma.appointment.upsert({
      where: { id: `appt-seed-${i}` },
      update: {},
      create: {
        id: `appt-seed-${i}`,
        customerId, storeId: slot.storeId,
        appointmentSlotId: slot.id, serviceId: service.id,
        date: slot.date, timeSlot: slot.time,
        status: a.status as any, notes: null,
      },
    })
  }
  console.log(`✅ ${APPT_DATA.length} appointments seeded`)

  // ── Enquiries ────────────────────────────────────────────────────────────────
  const ENQUIRY_DATA = [
    { store: 'springvale', name: 'Harper Wells',   phone: '0412556030', email: 'harper.w@example.com', message: 'Hi, how much for 4 Michelin Pilot Sport for a Golf GTI?',          status: 'NEW'         },
    { store: 'springvale', name: 'Marcus Lee',     phone: '0413220884', email: 'marcus.l@example.com', message: 'I need to book a log book service for a 2021 RAV4 this Friday.',   status: 'RESOLVED'    },
    { store: 'dandenong',  name: 'Tina Alvarez',   phone: '0414905117', email: 'tina.a@example.com',   message: 'How much does a roadworthy cost and do I need to book?',            status: 'RESOLVED'    },
    { store: 'bayswater',  name: 'Owen Brooks',    phone: '0415663422', email: 'owen.b@example.com',   message: 'My brakes are grinding — front pads need replacing on a Mazda CX-5.',status: 'RESOLVED'   },
    { store: 'sefton',     name: 'Priya Naidu',    phone: '0417118990', email: 'priya.n@example.com',  message: 'What is the cost for a wheel alignment? I have a 2022 Kia Stinger.',status: 'NEW'         },
    { store: 'springvale', name: 'Unknown Caller', phone: '0416770201', email: 'unknown@example.com',  message: 'Missed call — no voicemail left. Please call back.',                 status: 'NEW'         },
    { store: 'alphington', name: 'Bella Martin',   phone: '0418334556', email: 'bella.m@example.com',  message: 'What is included in the 3 year service and how long does it take?', status: 'IN_PROGRESS' },
    { store: 'dandenong',  name: 'Chris Taylor',   phone: '0419221007', email: 'chris.t@example.com',  message: 'Do you stock Bridgestone and Continental tyres in 225/45R17?',       status: 'RESOLVED'    },
  ]
  for (let i = 0; i < ENQUIRY_DATA.length; i++) {
    const e = ENQUIRY_DATA[i]
    const storeId = storeIdMap[e.store]
    if (!storeId) continue
    const createdAt = new Date(now)
    createdAt.setHours(now.getHours() - i * 2)
    await prisma.enquiry.upsert({
      where: { id: `enq-seed-${i}` },
      update: {},
      create: {
        id: `enq-seed-${i}`,
        name: e.name, phone: e.phone, email: e.email,
        message: e.message, type: 'general',
        source: storeId,            // source field is the store FK in this schema
        status: e.status as any, createdAt,
      },
    })
  }
  console.log(`✅ ${ENQUIRY_DATA.length} enquiries seeded`)

  // ── Chat conversations + messages ─────────────────────────────────────────────
  const CHAT_DATA = [
    {
      store: 'springvale', status: 'active',
      messages: [
        { senderType: 'CUSTOMER', body: 'Hi, how much for a log book service on a 2021 RAV4?', minsAgo: 60 },
        { senderType: 'AGENT',    body: 'Morning! A log book service for the RAV4 is $149 incl. parts and a warranty stamp.', minsAgo: 55 },
        { senderType: 'CUSTOMER', body: 'Great. Can you fit me in this Friday?', minsAgo: 40 },
        { senderType: 'CUSTOMER', body: 'Also do you do a free safety check with it?', minsAgo: 39 },
      ],
    },
    {
      store: 'springvale', status: 'active',
      messages: [
        { senderType: 'CUSTOMER', body: 'Do I need to book for the free pre-RWC check or can I just drop in?', minsAgo: 90 },
      ],
    },
    {
      store: 'sefton', status: 'active',
      messages: [
        { senderType: 'AGENT',    body: 'Hi, your 4 tyres have arrived and are ready to fit.', minsAgo: 180 },
        { senderType: 'CUSTOMER', body: 'Perfect — I\'ll come by at 2pm today.', minsAgo: 160 },
      ],
    },
    {
      store: 'dandenong', status: 'resolved',
      messages: [
        { senderType: 'CUSTOMER', body: 'My brakes are squeaking, can you take a look?', minsAgo: 2880 },
        { senderType: 'AGENT',    body: 'Of course — come in Thursday and we\'ll check the front pads.', minsAgo: 2820 },
        { senderType: 'CUSTOMER', body: 'Thanks, much quieter now.', minsAgo: 1440 },
      ],
    },
  ]
  for (let i = 0; i < CHAT_DATA.length; i++) {
    const cd = CHAT_DATA[i]
    const storeId = storeIdMap[cd.store]
    const customerId = customerIds[i % customerIds.length]
    if (!storeId || !customerId) continue
    const conv = await prisma.chatConversation.upsert({
      where: { id: `conv-seed-${i}` },
      update: {},
      create: { id: `conv-seed-${i}`, storeId, customerId, status: cd.status },
    })
    for (let j = 0; j < cd.messages.length; j++) {
      const m = cd.messages[j]
      const createdAt = new Date(now.getTime() - m.minsAgo * 60 * 1000)
      await prisma.chatMessage.upsert({
        where: { id: `msg-seed-${i}-${j}` },
        update: {},
        create: {
          id: `msg-seed-${i}-${j}`,
          conversationId: conv.id,
          senderType: m.senderType,
          senderId: m.senderType === 'CUSTOMER' ? customerId : superAdmin.id,
          body: m.body, isRead: m.minsAgo > 60, createdAt,
        },
      })
    }
  }
  console.log(`✅ ${CHAT_DATA.length} chat conversations seeded`)

  // ── PageSEO ───────────────────────────────────────────────────────────────────
  const SEO_PAGES = [
    { entityType: 'page', entityId: 'home',      metaTitle: 'Nova Tyres | Warehouse Direct Tyres & Wheels',             metaDesc: 'Nova Tyres offers warehouse-direct pricing on tyres and wheels with professional fitting across 9 Australian locations.' },
    { entityType: 'page', entityId: 'tyres',     metaTitle: 'Buy Tyres Online | Nova Tyres Australia',                  metaDesc: 'Search and buy tyres by size or brand. Wide range of passenger, SUV and 4WD tyres with same-day fitting.' },
    { entityType: 'page', entityId: 'wheels',    metaTitle: 'Alloy Wheels Australia | Nova Tyres',                      metaDesc: 'Shop alloy wheels from top brands. Find the perfect set for your car with expert fitting at any Nova Tyres location.' },
    { entityType: 'page', entityId: 'service',   metaTitle: 'Car Service Melbourne & Sydney | Nova Tyres',              metaDesc: 'Affordable car servicing including log book, yearly and 3/6 year service packages. Warranty-safe with genuine parts.' },
    { entityType: 'page', entityId: 'locations', metaTitle: 'Nova Tyres Store Locations | Melbourne, Sydney & More',    metaDesc: 'Find your nearest Nova Tyres store across Melbourne, Sydney and Australia. Open 6 days a week.' },
    { entityType: 'page', entityId: 'warranty',  metaTitle: 'Tyre Warranty & Returns | Nova Tyres',                    metaDesc: 'Nova Tyres warranty and returns policy. All products covered by manufacturer warranty.' },
    { entityType: 'page', entityId: 'about',     metaTitle: 'About Nova Tyres | Australian Tyre Retailer',             metaDesc: 'Nova Tyres is an Australian tyre and wheel retailer with 9+ locations, 4.8★ rating and 2,000+ verified reviews.' },
  ]
  for (const page of SEO_PAGES) {
    await prisma.pageSEO.upsert({
      where: { entityType_entityId: { entityType: page.entityType, entityId: page.entityId } },
      update: { metaTitle: page.metaTitle, metaDesc: page.metaDesc },
      create: { entityType: page.entityType, entityId: page.entityId, metaTitle: page.metaTitle, metaDesc: page.metaDesc },
    })
  }
  console.log(`✅ ${SEO_PAGES.length} PageSEO records seeded`)

  console.log('\n🎉 Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
