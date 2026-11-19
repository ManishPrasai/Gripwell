import { prisma } from '@nova/database'
import { STORES } from './stores'
import { fittingRate, isVehicleType, type VehicleType } from './fitting'
import {
  DAY_NAMES, addDays, dayLabel, londonNow, nextFree,
  type DayHours, type LondonNow,
} from './fitting-slots'

/* ── The departure board's data: the next free fitting bay at each branch ── */

export interface BoardRow {
  storeId:     string        // lib/stores id, e.g. 'camden'
  short:       string        // 'Camden'
  area:        string        // 'Camden NW1 9NX'
  date:        string | null // YYYY-MM-DD of the next free start
  day:         string | null // 'Today' | 'Tomorrow' | 'Sat 22 Nov'
  time:        string | null // 'HH:MM'
  free:        number        // bays free at that start
  fittingRate: number        // £ per wheel position, passenger car, VAT incl.
}

export interface Board { now: LondonNow; rows: BoardRow[] }

const LOOKAHEAD_DAYS = 7
const iso = (d: Date) => d.toISOString().slice(0, 10)

export async function loadBoard(vehicle: VehicleType = 'passenger', at: Date = new Date()): Promise<Board> {
  const now   = londonNow(at)
  const from  = new Date(`${now.date}T00:00:00Z`)
  const until = new Date(`${addDays(now.date, LOOKAHEAD_DAYS)}T00:00:00Z`)

  const stores = await prisma.store.findMany({
    where:  { slug: { in: STORES.map(s => s.id) }, isActive: true, deletedAt: null },
    select: {
      id: true, slug: true,
      hours:         { select: { dayOfWeek: true, openTime: true, closeTime: true, isClosed: true } },
      fittingPrices: { select: { vehicleType: true, price: true } },
    },
  })
  const ids = stores.map(s => s.id)
  const inRange = { gte: from, lt: until }

  const [appointments, guests, blocked] = await Promise.all([
    prisma.appointment.findMany({
      where:  { storeId: { in: ids }, date: inRange, status: { notIn: ['CANCELLED'] } },
      select: { storeId: true, date: true, timeSlot: true },
    }),
    prisma.guestAppointment.findMany({
      where:  { storeId: { in: ids }, status: { not: 'cancelled' }, appointmentSlot: { date: inRange } },
      select: { storeId: true, appointmentSlot: { select: { date: true, time: true } } },
    }),
    prisma.appointmentSlot.findMany({
      where:  { storeId: { in: ids }, date: inRange, isAvailable: false },
      select: { storeId: true, date: true, time: true },
    }),
  ])

  // storeId → date → start times
  const bookings = new Map<string, Map<string, string[]>>()
  const push = (storeId: string, date: string, time: string) => {
    const byDate = bookings.get(storeId) ?? new Map<string, string[]>()
    byDate.set(date, [...(byDate.get(date) ?? []), time])
    bookings.set(storeId, byDate)
  }
  for (const a of appointments) push(a.storeId, iso(a.date), a.timeSlot)
  for (const g of guests) push(g.storeId, iso(g.appointmentSlot.date), g.appointmentSlot.time)

  const off = new Map<string, Set<string>>()   // `${storeId}|${date}` → times
  for (const b of blocked) {
    const k = `${b.storeId}|${iso(b.date)}`
    off.set(k, (off.get(k) ?? new Set()).add(b.time))
  }

  const rows: BoardRow[] = STORES.flatMap(s => {
    const db = stores.find(d => d.slug === s.id)
    if (!db) return []
    const hours = new Map<number, DayHours>()
    for (const h of db.hours) {
      const wd = DAY_NAMES.indexOf(h.dayOfWeek as typeof DAY_NAMES[number])
      if (wd >= 0) hours.set(wd, { open: h.openTime, close: h.closeTime, closed: h.isClosed })
    }
    const prices: Partial<Record<VehicleType, number>> = {}
    for (const p of db.fittingPrices) if (isVehicleType(p.vehicleType)) prices[p.vehicleType] = Number(p.price)

    const next = nextFree({
      now,
      days:       LOOKAHEAD_DAYS,
      hoursFor:   wd => hours.get(wd),
      bookingsOn: date => bookings.get(db.id)?.get(date) ?? [],
      blockedOn:  date => off.get(`${db.id}|${date}`) ?? new Set(),
    })
    return [{
      storeId: s.id, short: s.short, area: s.suburb,
      date: next?.date ?? null,
      day:  next ? dayLabel(next.date, now.date) : null,
      time: next?.time ?? null,
      free: next?.free ?? 0,
      fittingRate: fittingRate(vehicle, prices),
    }]
  })

  // Soonest first; branches with nothing this week go last.
  rows.sort((a, b) =>
    (a.date && a.time ? `${a.date} ${a.time}` : '~').localeCompare(b.date && b.time ? `${b.date} ${b.time}` : '~')
    || a.short.localeCompare(b.short))

  return { now, rows }
}
