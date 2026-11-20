/* ── Fitting slots, generated from opening hours ─────────────────────────
   Pure functions, no database. A slot is a start time at which a fitting bay
   is free for the whole job. Bookings are subtracted by real overlap, so a
   09:00 job blocks the 08:30 and 09:30 starts on that bay, not just 09:00.
──────────────────────────────────────────────────────────────────────── */

export const SLOT_STEP_MIN = 30   // a new start every half hour
export const FIT_MIN       = 60   // a set of 4 takes about an hour
export const LEAD_MIN      = 60   // earliest same-day start: an hour from now
export const BAYS          = 2    // ponytail: one bay count for every branch; per-store bays when the admin can set them

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

export interface DayHours { open: string; close: string; closed: boolean }
export interface FreeSlot { time: string; free: number }

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
export const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** Free starts on one day at one branch, earliest first. */
export function freeSlots(opts: {
  hours?:       DayHours
  bookings:     string[]        // start times (HH:MM) of live bookings that day
  blocked?:     Set<string>     // start times the branch has switched off
  notBefore?:   number          // minutes since midnight; same-day cut-off
  bays?:        number
}): FreeSlot[] {
  const h = opts.hours
  if (!h || h.closed) return []
  const open = toMin(h.open), close = toMin(h.close)
  if (!(close > open)) return []
  const bays   = opts.bays ?? BAYS
  const starts = opts.bookings.map(toMin)
  // Bays in use at minute p: jobs that started at or before p and are still running.
  const busyAt = (p: number) => starts.filter(s => s <= p && p < s + FIT_MIN).length

  const out: FreeSlot[] = []
  for (let t = open; t + FIT_MIN <= close; t += SLOT_STEP_MIN) {
    if (t < (opts.notBefore ?? 0)) continue
    if (opts.blocked?.has(toHHMM(t))) continue
    let busy = 0
    for (let p = t; p < t + FIT_MIN; p += SLOT_STEP_MIN) busy = Math.max(busy, busyAt(p))
    const free = bays - busy
    if (free > 0) out.push({ time: toHHMM(t), free })
  }
  return out
}

/* ── London clock ─────────────────────────────────────────────────────── */
export interface LondonNow { date: string; weekday: number; minutes: number; clock: string }

export function londonNow(now: Date = new Date()): LondonNow {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(now).map(p => [p.type, p.value]),
  )
  const date = `${parts.year}-${parts.month}-${parts.day}`
  const minutes = Number(parts.hour) * 60 + Number(parts.minute)
  return { date, weekday: weekdayOf(date), minutes, clock: `${parts.hour}:${parts.minute}` }
}

/** YYYY-MM-DD plus n days, calendar arithmetic only (no time zone involved). */
export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export const weekdayOf = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay()

/** "Today", "Tomorrow", or "Sat 22 Nov". */
export function dayLabel(date: string, today: string): string {
  if (date === today) return 'Today'
  if (date === addDays(today, 1)) return 'Tomorrow'
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' })
}

/** The first free start at a branch within `days` days, or null. */
export function nextFree(opts: {
  now:      LondonNow
  hoursFor: (weekday: number) => DayHours | undefined
  bookingsOn: (date: string) => string[]
  blockedOn?: (date: string) => Set<string>
  days?:    number
}): { date: string; time: string; free: number } | null {
  for (let i = 0; i < (opts.days ?? 7); i++) {
    const date = addDays(opts.now.date, i)
    const slots = freeSlots({
      hours:     opts.hoursFor(weekdayOf(date)),
      bookings:  opts.bookingsOn(date),
      blocked:   opts.blockedOn?.(date),
      notBefore: i === 0 ? opts.now.minutes + LEAD_MIN : 0,
    })
    if (slots.length) return { date, ...slots[0] }
  }
  return null
}

/** The board's Bays column, in the words a driver would use. */
export function bayStatus(r: { time: string | null; day: string | null; free: number; leftToday: number }): string {
  if (!r.time)           return 'Full this week'
  if (r.day !== 'Today') return 'Full today'
  if (r.leftToday === 1) return 'Last bay'
  return `${r.free} free`
}
