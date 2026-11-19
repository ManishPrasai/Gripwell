import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaClient, TyreType } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const STORES = [
  { name: 'Gripwell Camden',      slug: 'camden',      address: '14 Kentish Town Rd',  suburb: 'Camden',         state: 'North London',   postcode: 'NW1 9NX',  phone: '+44 20 7946 0101', email: 'camden@gripwell.demo',      lat: 51.5417,  lon: -0.1428 },
  { name: 'Gripwell Shoreditch',  slug: 'shoreditch',  address: '82 Brick Lane',       suburb: 'Shoreditch',     state: 'East London',    postcode: 'E1 6RL',   phone: '+44 20 7946 0202', email: 'shoreditch@gripwell.demo',  lat: 51.5226,  lon: -0.0718 },
  { name: 'Gripwell Brixton',     slug: 'brixton',     address: '31 Atlantic Rd',      suburb: 'Brixton',        state: 'South London',   postcode: 'SW9 8HX',  phone: '+44 20 7946 0303', email: 'brixton@gripwell.demo',     lat: 51.4613,  lon: -0.1156 },
  { name: 'Gripwell Hammersmith', slug: 'hammersmith', address: '5 King St',           suburb: 'Hammersmith',    state: 'West London',    postcode: 'W6 9HR',   phone: '+44 20 7946 0404', email: 'hammersmith@gripwell.demo', lat: 51.4927,  lon: -0.2239 },
  { name: 'Gripwell Islington',   slug: 'islington',   address: '118 Upper St',        suburb: 'Islington',      state: 'North London',   postcode: 'N1 1QP',   phone: '+44 20 7946 0505', email: 'islington@gripwell.demo',   lat: 51.5363,  lon: -0.1032 },
  { name: 'Gripwell Greenwich',   slug: 'greenwich',   address: '47 Greenwich High Rd',suburb: 'Greenwich',      state: 'South East',     postcode: 'SE10 8JL', phone: '+44 20 7946 0606', email: 'greenwich@gripwell.demo',   lat: 51.4769,  lon: -0.0004 },
  { name: 'Gripwell City',        slug: 'citycentre',  address: '9 Cheapside',         suburb: 'City of London', state: 'Central London', postcode: 'EC2V 6AA', phone: '+44 20 7946 0707', email: 'city@gripwell.demo',        lat: 51.5138,  lon: -0.0934 },
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
  { name: 'Free MOT check',     description: 'Comprehensive pre-MOT certificate inspection to identify any issues before your official MOT test. Includes brakes, tyres, lights, steering and suspension.',         priceFrom: 0,   durationMinutes: 45  },
  { name: 'Free Safety Inspection', description: 'A thorough safety check of your vehicle covering tyres, brakes, lights, steering and fluid levels at no cost to you.',                                                       priceFrom: 0,   durationMinutes: 30  },
  { name: 'Manufacturer Service',   description: "Full manufacturer-scheduled service, stamped in your service book, to keep your new car warranty intact and your vehicle running at peak performance.",                                             priceFrom: 149, durationMinutes: 90  },
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
    brand: 'Meridian', model: 'Trailmark A/T',
    slug: 'meridian-trailmark-at-245-70r16',
    type: TyreType.SUV, sizeIdx: 0, price: 91.50,
    isBestSeller: true, isFeatured: true,
    description: 'The Trailmark A/T combines on-road comfort with proven off-road capability. Ideal for SUVs and 4x4s that need reliable all-terrain performance year-round.',
  },
  {
    brand: 'Kova', model: 'Apex S3',
    slug: 'kova-apex-s3-215-65r16',
    type: TyreType.PASSENGER, sizeIdx: 1, price: 120.50,
    isBestSeller: false, isFeatured: true,
    description: 'The Apex S3 delivers outstanding dry and wet handling for sporty passenger vehicles. High-speed stability meets responsive, precise steering feel.',
  },
  {
    brand: 'Meridian', model: 'Citadel UX7',
    slug: 'meridian-citadel-ux7-215-65r16',
    type: TyreType.PASSENGER, sizeIdx: 1, price: 100.00,
    isBestSeller: true, isFeatured: false,
    description: "Meridian's advanced touring tyre offering exceptional comfort, fuel efficiency and all-weather safety — engineered for everyday drivers who demand more.",
  },
  {
    brand: 'Corsaro', model: 'Strada Sport',
    slug: 'corsaro-strada-sport-245-45r18',
    type: TyreType.PASSENGER, sizeIdx: 2, price: 185.00,
    isBestSeller: false, isFeatured: true,
    description: "Corsaro's flagship ultra-high-performance tyre. Track-derived technology delivers maximum dry grip and precise handling for performance and luxury vehicles.",
  },
  {
    brand: 'Terrain X', model: 'Velo Sport 5',
    slug: 'terrain-x-velo-sport-5-225-40r18',
    type: TyreType.PASSENGER, sizeIdx: 3, price: 145.00,
    isBestSeller: true, isFeatured: false,
    description: 'The Velo Sport 5 provides high performance at a competitive price. Optimised for sports and performance vehicles with excellent handling in wet and dry conditions.',
  },
  {
    brand: 'Kova', model: 'Ecoline 2',
    slug: 'kova-ecoline-2-205-55r16',
    type: TyreType.PASSENGER, sizeIdx: 4, price: 98.00,
    isBestSeller: false, isFeatured: false,
    description: 'The Ecoline 2 prioritises fuel efficiency and all-season safety. Perfect for everyday commuters seeking economy without compromising ride comfort or wet traction.',
  },
  {
    brand: 'Corsaro', model: 'Lumen P7',
    slug: 'corsaro-lumen-p7-225-50r17',
    type: TyreType.PASSENGER, sizeIdx: 5, price: 160.00,
    isBestSeller: false, isFeatured: false,
    description: "Corsaro's green performance tyre combining efficiency and safety with low rolling resistance. Engineered for premium vehicles that demand comfort and environmental responsibility.",
  },
  {
    brand: 'Zetland', model: 'Ridgeline A/T',
    slug: 'zetland-ridgeline-at-265-70r16',
    type: TyreType.MUD_TERRAIN, sizeIdx: 6, price: 199.00,
    isBestSeller: true, isFeatured: true,
    description: "A proven all-terrain tyre for 4x4s and SUVs. Aggressive shoulder blocks deliver confident off-road grip while maintaining quiet, comfortable highway manners.",
  },
  {
    brand: 'Brackley', model: 'Mudline M/T',
    slug: 'brackley-mudline-mt-275-55r20',
    type: TyreType.MUD_TERRAIN, sizeIdx: 7, price: 329.00,
    isBestSeller: false, isFeatured: true,
    description: 'Serious mud-terrain tyre engineered for maximum off-road traction in the toughest conditions. Massive tread lugs self-clean in deep mud, rocks and loose terrain.',
  },
]

const WHEELS = [
  {
    brand: 'Halden', model: 'Outrider', slug: 'halden-outrider-17x85',
    diameter: 17, width: 8.5, pcd: '6×139.7', offset: -18, finish: 'Matte Black',  price: 230.00,
    description: 'Premium off-road alloy wheel built for serious 4x4 performance. Deep dish design with aggressive styling and high load rating for heavy-duty applications.',
  },
  {
    brand: 'Halden', model: 'Bastion', slug: 'halden-bastion-18x9',
    diameter: 18, width: 9.0, pcd: '5×114.3', offset: 12,  finish: 'Bronze',       price: 265.00,
    description: 'Heavy-duty durability meets refined aesthetics. Multi-spoke design in striking bronze pairs perfectly with lifted SUVs and double-cab pickups.',
  },
  {
    brand: 'Ostra', model: 'Ranger',    slug: 'ostra-ranger-16x8',
    diameter: 16, width: 8.0, pcd: '6×139.7', offset: -10, finish: 'Gunmetal',     price: 195.00,
    description: "A tough, proven off-road wheel. The Ostra Ranger is engineered for tough conditions with a proven track record across all terrains — mud, rock and everything in between.",
  },
  {
    brand: 'Ostra', model: 'Summit',    slug: 'ostra-summit-20x9',
    diameter: 20, width: 9.0, pcd: '5×150',   offset: 18,  finish: 'Satin Black',  price: 295.00,
    description: 'Combines aggressive styling with everyday usability. Large diameter options for lifted trucks and SUVs that need presence without sacrificing practicality.',
  },
  {
    brand: 'Marlow', model: 'Stride',   slug: 'marlow-stride-17x8',
    diameter: 17, width: 8.0, pcd: '6×139.7', offset: -10, finish: 'Gloss Black',  price: 185.00,
    description: 'Value-packed alloy wheel offering great looks at an accessible price. The Marlow Stride is the perfect upgrade for 4x4s and pickups seeking style and strength.',
  },
  {
    brand: 'Vanta', model: 'XR7',       slug: 'vanta-xr7-18x85',
    diameter: 18, width: 8.5, pcd: '5×112',   offset: 35,  finish: 'Hyper Silver', price: 175.00,
    description: 'European styling at a sensible price. The XR7 features a refined multi-spoke design in hyper silver that complements European and Japanese passenger vehicles.',
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
  const passwordHash = await hashPassword('admin123456')
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@gripwell.demo' },
    update: {},
    create: { firstName: 'Gripwell', lastName: 'Admin', email: 'admin@gripwell.demo', passwordHash, role: 'SUPER_ADMIN', isActive: true },
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
  const tyreIdBySlug: Record<string, string> = {}
  for (const t of TYRES) {
    const tyre = await prisma.tyre.upsert({
      where: { slug: t.slug },
      // No was-price: SALE only shows where a real former price exists (UK pricing rules).
      update: { description: t.description, price: t.price, compareAtPrice: null, isBestSeller: t.isBestSeller, isFeatured: t.isFeatured },
      create: {
        brand: t.brand, model: t.model, description: t.description, slug: t.slug,
        type: t.type, tyreSizeId: sizeIds[t.sizeIdx], price: t.price,
        compareAtPrice: null,
        stockQuantity: Math.floor(Math.random() * 30) + 10,
        isBestSeller: t.isBestSeller, isFeatured: t.isFeatured, isActive: true,
      },
    })
    tyreIdBySlug[t.slug] = tyre.id
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
  const wheelIdBySlug: Record<string, string> = {}
  for (const w of WHEELS) {
    const wheel = await prisma.wheel.upsert({
      where: { slug: w.slug },
      update: { description: w.description, price: w.price, compareAtPrice: null },
      create: {
        brand: w.brand, model: w.model, description: w.description, slug: w.slug,
        diameter: w.diameter, width: w.width, pcd: w.pcd, offset: w.offset,
        material: 'Alloy', finish: w.finish, price: w.price,
        compareAtPrice: null,
        stockQuantity: Math.floor(Math.random() * 16) + 4, isActive: true,
      },
    })
    wheelIdBySlug[w.slug] = wheel.id
    const imageCount = await prisma.wheelImage.count({ where: { wheelId: wheel.id } })
    if (imageCount === 0) {
      await prisma.wheelImage.create({
        data: { wheelId: wheel.id, url: '/images/wheel/Wheel 1.png', altText: `${w.brand} ${w.model}`, sortOrder: 0 },
      })
    }
    console.log(`  → ${w.brand} ${w.model}`)
  }
  console.log('✅ Wheels seeded')

  // ── Retire leftovers from the previous (Australian) business ────────────────
  //  Upserts never remove rows, so old AU stores, the old real-brand catalogue
  //  and the £0 test product stayed live. Hide them (isActive=false) rather than
  //  delete, so historical orders/appointments keep their foreign keys.
  const retiredStores = await prisma.store.updateMany({
    where: { slug: { notIn: STORES.map(s => s.slug) }, isActive: true },
    data:  { isActive: false },
  })
  const retiredTyres = await prisma.tyre.updateMany({
    where: { isActive: true, OR: [{ slug: { notIn: TYRES.map(t => t.slug) } }, { price: { lte: 0 } }] },
    data:  { isActive: false },
  })
  const retiredWheels = await prisma.wheel.updateMany({
    where: { isActive: true, OR: [{ slug: { notIn: WHEELS.map(w => w.slug) } }, { price: { lte: 0 } }] },
    data:  { isActive: false },
  })
  console.log(`✅ Retired ${retiredStores.count} old stores, ${retiredTyres.count} tyres, ${retiredWheels.count} wheels not in the Gripwell catalogue`)

  // ── Store Manager Admin Users ────────────────────────────────────────────────
  const managerPassword = await hashPassword('manager123456')
  const MANAGERS = [
    { first: 'Daniel',  last: 'Mercer',  email: 'daniel.m@gripwell.demo',  slug: 'camden'      },
    { first: 'Sophie',  last: 'Kaur',    email: 'sophie.k@gripwell.demo',  slug: 'shoreditch'  },
    { first: 'Raj',     last: 'Thakur',  email: 'raj.t@gripwell.demo',     slug: 'brixton'     },
    { first: 'Lauren',  last: 'Nguyen',  email: 'lauren.n@gripwell.demo',  slug: 'hammersmith' },
    { first: 'Priya',   last: 'Sharma',  email: 'priya.s@gripwell.demo',   slug: 'islington'   },
    { first: 'Marco',   last: 'Vella',   email: 'marco.v@gripwell.demo',   slug: 'citycentre'  },
  ]
  const managerIdBySlug: Record<string, string> = {}
  for (const m of MANAGERS) {
    const storeId = storeIdMap[m.slug]
    if (!storeId) continue
    managerIdBySlug[m.slug] = (await prisma.adminUser.upsert({
      where: { email: m.email },
      update: { storeId },
      create: { firstName: m.first, lastName: m.last, email: m.email, passwordHash: managerPassword, role: 'STORE_MANAGER', storeId, isActive: true },
    })).id
  }
  console.log(`✅ ${MANAGERS.length} store managers seeded`)

  // ── Demo dataset ─────────────────────────────────────────────────────────────
  //  A deliberate, clearly fictional dataset, built only from the rows below:
  //  never from real customers or rows left behind by tests.
  //  • Customers use the reserved `.test` domain and Ofcom drama numbers
  //    (07700 900xxx), so no real person can be emailed or called.
  //  • Every demo row's id starts with "demo-". Each run deletes those rows (plus
  //    rows from the older seed's "*-seed-*" ids) and rebuilds them, so the seed
  //    is safe to run any number of times and dates stay inside the last 60 days.
  //  • Store reviews are titled "[Demo] …" and never marked as verified purchases.
  //  • Money follows the storefront rules (apps/customer/lib/fitting.ts): prices
  //    include VAT and fitting is charged once per wheel position.
  const DAY = 24 * 60 * 60 * 1000
  const nowMs = Date.now()
  const daysAgo = (d: number, hour = 10) => { const t = new Date(nowMs - d * DAY); t.setHours(hour, 0, 0, 0); return t }
  const ids = (...prefixes: string[]) => ({ OR: prefixes.map(p => ({ id: { startsWith: p } })) })

  // Reset: release slot bookings held by demo appointments, then delete demo rows child-first.
  for (const a of await prisma.appointment.findMany({ where: ids('demo-', 'appt-seed-'), select: { appointmentSlotId: true } })) {
    await prisma.appointmentSlot.updateMany({ where: { id: a.appointmentSlotId, currentBookings: { gt: 0 } }, data: { currentBookings: { decrement: 1 } } })
  }
  await prisma.chatMessage.deleteMany({ where: ids('demo-', 'msg-seed-') })
  await prisma.chatConversation.deleteMany({ where: ids('demo-', 'conv-seed-') })
  await prisma.review.deleteMany({ where: ids('demo-', 'review-seed-') })
  await prisma.appointment.deleteMany({ where: ids('demo-', 'appt-seed-') })
  await prisma.enquiry.deleteMany({ where: ids('demo-', 'enq-seed-') })
  await prisma.payment.deleteMany({ where: ids('demo-') })
  await prisma.orderStatusHistory.deleteMany({ where: ids('demo-') })
  await prisma.orderItem.deleteMany({ where: ids('demo-') })
  await prisma.order.deleteMany({ where: ids('demo-') })

  // Customers: upserted by email, so their ids survive re-runs.
  const DEMO_CUSTOMERS = [
    ['Amara', 'Okafor'], ['Tom', 'Hollis'], ['Anika', 'Desai'], ['Callum', 'Reid'], ['Sofia', 'Marin'],
    ['Daniel', 'Abbott'], ['Hannah', 'Leigh'], ['Kwame', 'Mensah'], ['Isla', 'Fraser'], ['Ravi', 'Chandran'],
    ['Grace', 'Whitfield'], ['Luca', 'Bellini'], ['Nadia', 'Haddad'], ['Owen', 'Pryce'], ['Megan', 'Doyle'],
  ] as const
  const unusableHash = await hashPassword(`demo-no-login-${nowMs}`)   // demo accounts cannot sign in
  const customers: { id: string; name: string; email: string; phone: string }[] = []
  for (let i = 0; i < DEMO_CUSTOMERS.length; i++) {
    const [firstName, lastName] = DEMO_CUSTOMERS[i]
    const email = `${firstName}.${lastName}@demo.gripwell.test`.toLowerCase()
    const phone = `+44 7700 900${String(101 + i * 7).padStart(3, '0')}`
    const c = await prisma.customer.upsert({
      where:  { email },
      update: { firstName, lastName, phone, isActive: true, deletedAt: null },
      create: { id: `demo-cust-${String(i + 1).padStart(2, '0')}`, firstName, lastName, email, phone, passwordHash: unusableHash, isVerified: true, createdAt: daysAgo(90 - i) },
    })
    customers.push({ id: c.id, name: `${firstName} ${lastName}`, email, phone })
  }
  console.log(`✅ ${customers.length} demo customers seeded`)

  // Orders: 25 spread over the last 60 days, with mixed outcomes.
  const RATE: Record<string, number> = { PASSENGER: 25, SUV: 30, MUD_TERRAIN: 30, COMMERCIAL: 35 }   // = DEFAULT_FITTING_PRICES
  const ORDER_NOTES = ['Please call when the tyres arrive.', 'Locking wheel nut key is in the glovebox.', 'Can you check the tracking while it is in?']
  const staffFor = (slug: string) => managerIdBySlug[slug] ?? superAdmin.id
  const fittedOrders: { id: string; customerId: string; storeId: string; at: Date }[] = []
  for (let i = 0; i < 25; i++) {
    const id = `demo-order-${String(i + 1).padStart(2, '0')}`
    const customer = customers[(i * 4) % customers.length]
    const storeSlug = STORES[i % STORES.length].slug
    const storeId = storeIdMap[storeSlug]
    const age = 59 - Math.round(i * 57 / 24)                 // 59 days ago → 2 days ago
    const createdAt = daysAgo(age, 9 + (i % 8))

    const wheelsOnly = i % 8 === 5
    const tyre  = wheelsOnly ? null : TYRES[i % TYRES.length]
    const tyreQty = tyre ? [4, 4, 2, 4, 1][i % 5] : 0
    const wheel = wheelsOnly || i % 6 === 2 ? WHEELS[i % WHEELS.length] : null
    const wheelQty = wheel ? 4 : 0
    const fit = i % 7 !== 3                                   // every 7th order is collected, not fitted
    const positions = Math.max(tyreQty, wheelQty)
    const fitting = fit ? (tyre ? RATE[tyre.type] : RATE.PASSENGER) * positions : 0
    const subtotal = (tyre ? tyre.price * tyreQty : 0) + (wheel ? wheel.price * wheelQty : 0)
    const total = subtotal + fitting

    const [status, paymentStatus] =
      i === 4 || i === 15 ? ['CANCELLED', 'REFUNDED'] :
      i === 9 || i === 19 ? ['REFUNDED',  'REFUNDED'] :
      i >= 23             ? ['PENDING',   'PAID'] :
      age > 14            ? ['FITTED',    'PAID'] :
                            ['CONFIRMED', 'PAID']

    const items = [
      ...(tyre  ? [{ id: `${id}-t`, itemType: 'tyre',  tyreId:  tyreIdBySlug[tyre.slug],   quantity: tyreQty,  unitPrice: tyre.price,  totalPrice: tyre.price * tyreQty }]   : []),
      ...(wheel ? [{ id: `${id}-w`, itemType: 'wheel', wheelId: wheelIdBySlug[wheel.slug], quantity: wheelQty, unitPrice: wheel.price, totalPrice: wheel.price * wheelQty }] : []),
      ...(fitting > 0 ? [{ id: `${id}-f`, itemType: 'fitting', quantity: 1, unitPrice: fitting, totalPrice: fitting }] : []),
    ]
    const later = new Date(createdAt.getTime() + (1 + (i % 3)) * DAY)
    const history = [
      { id: `${id}-h1`, status: status === 'PENDING' ? 'PENDING' : 'CONFIRMED', changedBy: staffFor(storeSlug), note: 'Payment received', createdAt },
      ...(status === 'FITTED'    ? [{ id: `${id}-h2`, status, changedBy: staffFor(storeSlug), note: fit ? 'Fitted at branch' : 'Collected from branch', createdAt: later }] : []),
      ...(status === 'CANCELLED' ? [{ id: `${id}-h2`, status, changedBy: staffFor(storeSlug), note: 'Cancelled at customer request, refunded in full', createdAt: later }] : []),
      ...(status === 'REFUNDED'  ? [{ id: `${id}-h2`, status, changedBy: staffFor(storeSlug), note: 'Wrong size ordered, returned unused and refunded', createdAt: later }] : []),
    ]
    await prisma.order.create({
      data: {
        id, customerId: customer.id, storeId, createdAt,
        status: status as any, paymentStatus: paymentStatus as any,
        subtotal, discountAmount: 0, total, paymentMethod: 'stripe',
        notes: i % 5 === 1 ? ORDER_NOTES[i % ORDER_NOTES.length] : null,
        items: { create: items },
        statusHistory: { create: history },
        payments: { create: [{ id: `${id}-p`, method: 'card', amount: total, status: paymentStatus === 'REFUNDED' ? 'refunded' : 'succeeded', createdAt }] },
      },
    })
    if (status === 'FITTED') fittedOrders.push({ id, customerId: customer.id, storeId, at: later })
  }
  console.log('✅ 25 demo orders seeded')

  // Store reviews: left by customers after a fitted order, clearly marked as demo content.
  const REVIEWS = [
    [5, 'Quick and clear',        'Booked online, fitted within the hour and the price matched the basket exactly.'],
    [4, 'Good, slight wait',       'Good job on the tyres. Waited about 20 minutes longer than quoted.'],
    [5, 'Explained everything',    'They showed me the tread on the old tyres before swapping them. No upsell.'],
    [3, 'Fine but busy',           'Work was fine, but the branch was busy and nobody told me it would take longer.'],
    [5, 'Easy collection',         'Picked my wheels up on the way home. Everything was boxed and labelled.'],
    [4, 'Fair price',              'Fitting price was what the site said. Would use again.'],
    [5, 'Friendly team',           'Friendly, fast and they rebalanced a wheel I had not even mentioned.'],
    [2, 'Had to come back',        'A valve was leaking the next day. They fixed it free, but it cost me a second trip.'],
    [5, 'No surprises',            'Total on the receipt was the total I saw when I paid.'],
    [4, 'Solid',                   'Good communication by text on the day.'],
  ] as const
  const reviewCount = Math.min(REVIEWS.length, fittedOrders.length)
  for (let i = 0; i < reviewCount; i++) {
    const o = fittedOrders[i]
    const [rating, title, body] = REVIEWS[i]
    await prisma.review.create({
      data: {
        id: `demo-review-${String(i + 1).padStart(2, '0')}`,
        customerId: o.customerId, storeId: o.storeId, orderId: o.id,
        rating, title: `[Demo] ${title}`, body,
        isVerifiedPurchase: false, isApproved: true,
        createdAt: new Date(Math.min(o.at.getTime() + DAY, nowMs)),
      },
    })
  }
  console.log(`✅ ${reviewCount} demo store reviews seeded (titled "[Demo]")`)

  // Appointments: past (completed, a no-show, a cancellation) and upcoming.
  const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } })
  const VEHICLES = ['2019 Ford Focus', '2021 Toyota RAV4', '2018 VW Golf', '2022 Kia Sportage', '2020 Nissan Qashqai', '2017 Vauxhall Astra']
  const APPT_DAYS = [-41, -33, -27, -20, -14, -9, -5, -2, 2, 4, 8, 13]
  for (let i = 0; i < APPT_DAYS.length; i++) {
    const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() + APPT_DAYS[i])
    if (day.getDay() === 0) day.setDate(day.getDate() + 1)  // branches are closed on Sundays
    const times = day.getDay() === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS
    const time = times[i % times.length]
    const storeId = storeIdMap[STORES[(i * 3) % STORES.length].slug]
    const slot = await prisma.appointmentSlot.upsert({
      where:  { storeId_date_time: { storeId, date: day, time } },
      update: { currentBookings: { increment: 1 } },
      create: { storeId, date: day, time, isAvailable: true, maxBookings: 2, currentBookings: 1 },
    })
    const past = APPT_DAYS[i] < 0
    const status = past ? (i === 3 ? 'NO_SHOW' : i === 5 ? 'CANCELLED' : 'COMPLETED') : (i % 2 ? 'PENDING' : 'CONFIRMED')
    await prisma.appointment.create({
      data: {
        id: `demo-appt-${String(i + 1).padStart(2, '0')}`,
        customerId: customers[(i * 2 + 1) % customers.length].id, storeId,
        appointmentSlotId: slot.id, serviceId: services[i % services.length].id,
        date: day, timeSlot: time, status: status as any,
        notes: `Vehicle: ${VEHICLES[i % VEHICLES.length]}`,
        reminderSent: past, createdAt: daysAgo(Math.max(1, -APPT_DAYS[i] + 7)),
      },
    })
  }
  console.log(`✅ ${APPT_DAYS.length} demo appointments seeded`)

  // Enquiries: a few, from demo customers.
  const ENQUIRIES = [
    ['camden',      'NEW',         'Do you have the Kova Apex S3 in 215/65R16 in stock for Saturday?'],
    ['shoreditch',  'IN_PROGRESS', 'How much is a wheel alignment, and can it be done with new tyres?'],
    ['brixton',     'RESOLVED',    'Can I collect my order on a different day from the one I picked?'],
    ['greenwich',   'NEW',         'Is the free safety inspection available without booking?'],
    ['hammersmith', 'RESOLVED',    'I think I ordered the wrong rim size. Can I swap before fitting?'],
  ] as const
  for (let i = 0; i < ENQUIRIES.length; i++) {
    const [slug, status, message] = ENQUIRIES[i]
    const c = customers[(i * 3 + 2) % customers.length]
    await prisma.enquiry.create({
      data: {
        id: `demo-enq-${i + 1}`, customerId: c.id,
        name: c.name, phone: c.phone, email: c.email, message, type: 'general',
        regoOrVehicle: VEHICLES[(i + 2) % VEHICLES.length],
        source: storeIdMap[slug], status: status as any, createdAt: daysAgo(i * 3 + 1, 11),
      },
    })
  }
  console.log(`✅ ${ENQUIRIES.length} demo enquiries seeded`)

  // Chats: a handful of short conversations with demo customers.
  const CHATS = [
    { store: 'camden', status: 'active', msgs: [['CUSTOMER', 'Hi, how much for a manufacturer service on a 2021 RAV4?', 60], ['AGENT', 'Morning! It is from £149, and we stamp your service book.', 55], ['CUSTOMER', 'Great. Can you fit me in this Friday?', 40]] },
    { store: 'camden', status: 'active', msgs: [['CUSTOMER', 'Do I need to book the free MOT check or can I just drop in?', 90]] },
    { store: 'greenwich', status: 'active', msgs: [['AGENT', 'Hi, your 4 tyres have arrived and are ready to fit.', 180], ['CUSTOMER', 'Perfect, I will come by at 2pm today.', 160]] },
    { store: 'shoreditch', status: 'resolved', msgs: [['CUSTOMER', 'My brakes are squeaking, can you take a look?', 2880], ['AGENT', 'Of course. Come in Thursday and we will check the front pads.', 2820], ['CUSTOMER', 'Thanks, much quieter now.', 1440]] },
  ] as const
  for (let i = 0; i < CHATS.length; i++) {
    const ch = CHATS[i]
    const customerId = customers[(i * 5 + 3) % customers.length].id
    await prisma.chatConversation.create({
      data: {
        id: `demo-chat-${i + 1}`, storeId: storeIdMap[ch.store], customerId, status: ch.status,
        messages: {
          create: ch.msgs.map(([senderType, body, minsAgo], j) => ({
            id: `demo-chat-${i + 1}-m${j + 1}`, senderType, body,
            senderId: senderType === 'CUSTOMER' ? customerId : staffFor(ch.store),
            isRead: minsAgo > 60, createdAt: new Date(nowMs - minsAgo * 60 * 1000),
          })),
        },
      },
    })
  }
  console.log(`✅ ${CHATS.length} demo chat conversations seeded`)

  // ── PageSEO ───────────────────────────────────────────────────────────────────
  const SEO_PAGES = [
    { entityType: 'page', entityId: 'home',      metaTitle: 'Gripwell | Tyres & Wheels — London',                   metaDesc: 'Gripwell offers competitive pricing on tyres and wheels with professional fitting across 7 London stores.' },
    { entityType: 'page', entityId: 'tyres',     metaTitle: 'Buy Tyres Online | Gripwell London',                   metaDesc: 'Search and buy tyres by size or brand. Wide range of passenger, SUV and 4x4 tyres with same-day fitting across London.' },
    { entityType: 'page', entityId: 'wheels',    metaTitle: 'Alloy Wheels London | Gripwell',                       metaDesc: 'Shop alloy wheels from leading brands. Find the perfect set for your car with expert fitting at any Gripwell store.' },
    { entityType: 'page', entityId: 'service',   metaTitle: 'Car Servicing London | Gripwell',                      metaDesc: 'Affordable car servicing including manufacturer-schedule, yearly and 3/6 year service packages. Warranty-safe with genuine parts.' },
    { entityType: 'page', entityId: 'locations', metaTitle: 'Gripwell Store Locations | London',                    metaDesc: 'Find your nearest Gripwell store across London. Seven locations including Camden, Shoreditch, Brixton and more.' },
    { entityType: 'page', entityId: 'warranty',  metaTitle: 'Tyre Warranty & Returns | Gripwell',                   metaDesc: 'Gripwell warranty and returns policy. All products covered by manufacturer warranty and UK Consumer Rights Act.' },
    { entityType: 'page', entityId: 'about',     metaTitle: 'About Gripwell | London Tyre Retailer',                metaDesc: 'Gripwell is a London tyre and wheel retailer with 7 locations across the city.' },
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
