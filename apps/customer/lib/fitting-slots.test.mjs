// Slot generation checks. Run: npm test -w customer
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { freeSlots, nextFree, londonNow, addDays, dayLabel, bayStatus } from './fitting-slots.ts'

const WEEKDAY = { open: '08:00', close: '17:30', closed: false }

test('open day with no bookings: half-hourly starts that finish by closing', () => {
  const s = freeSlots({ hours: WEEKDAY, bookings: [] })
  assert.equal(s[0].time, '08:00')
  assert.equal(s.at(-1).time, '16:30')          // 16:30 + 60 min = 17:30
  assert.equal(s.length, 18)
  assert.ok(s.every(x => x.free === 2))
})

test('closed day and missing hours give nothing', () => {
  assert.deepEqual(freeSlots({ hours: { open: '00:00', close: '00:00', closed: true }, bookings: [] }), [])
  assert.deepEqual(freeSlots({ hours: undefined, bookings: [] }), [])
})

test('a booking blocks every start that overlaps the job, by bay', () => {
  const s = Object.fromEntries(freeSlots({ hours: WEEKDAY, bookings: ['09:00'] }).map(x => [x.time, x.free]))
  assert.equal(s['08:00'], 2)   // ends 09:00, no overlap
  assert.equal(s['08:30'], 1)
  assert.equal(s['09:00'], 1)
  assert.equal(s['09:30'], 1)
  assert.equal(s['10:00'], 2)
})

test('two bays taken removes the start; back-to-back jobs on one bay do not', () => {
  const full = freeSlots({ hours: WEEKDAY, bookings: ['09:00', '09:00'] }).map(x => x.time)
  assert.ok(!full.includes('09:00') && !full.includes('08:30') && !full.includes('09:30'))
  // 08:00 then 09:00 can share one bay, so 08:30 still has the other bay free.
  const chain = Object.fromEntries(freeSlots({ hours: WEEKDAY, bookings: ['08:00', '09:00'] }).map(x => [x.time, x.free]))
  assert.equal(chain['08:30'], 1)
})

test('blocked starts and the same-day cut-off are respected', () => {
  const s = freeSlots({ hours: WEEKDAY, bookings: [], blocked: new Set(['12:00']), notBefore: 11 * 60 + 10 }).map(x => x.time)
  assert.equal(s[0], '11:30')
  assert.ok(!s.includes('12:00'))
})

test('nextFree rolls past a closed Sunday to Monday', () => {
  const now = { date: '2026-11-22', weekday: 0, minutes: 10 * 60, clock: '10:00' }   // Sunday
  const r = nextFree({
    now,
    hoursFor: wd => (wd === 0 ? { open: '00:00', close: '00:00', closed: true } : WEEKDAY),
    bookingsOn: () => [],
  })
  assert.deepEqual(r, { date: '2026-11-23', time: '08:00', free: 2 })
  assert.equal(dayLabel(r.date, now.date), 'Tomorrow')
})

test('after the last start today, the next slot is tomorrow', () => {
  const now = { date: '2026-11-19', weekday: 4, minutes: 16 * 60, clock: '16:00' }
  const r = nextFree({ now, hoursFor: () => WEEKDAY, bookingsOn: () => [] })
  assert.equal(r.date, '2026-11-20')
})

test('London clock follows BST and GMT', () => {
  assert.equal(londonNow(new Date('2026-07-01T12:00:00Z')).clock, '13:00')
  assert.equal(londonNow(new Date('2026-11-19T12:00:00Z')).clock, '12:00')
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
})

test('bays column: free count, last bay, full today, full this week', () => {
  assert.equal(bayStatus({ time: '09:00', day: 'Today', free: 2, leftToday: 12 }), '2 free')
  assert.equal(bayStatus({ time: '09:00', day: 'Today', free: 1, leftToday: 12 }), '1 free')
  assert.equal(bayStatus({ time: '15:00', day: 'Today', free: 1, leftToday: 1 }), 'Last bay')
  assert.equal(bayStatus({ time: '08:00', day: 'Tomorrow', free: 2, leftToday: 0 }), 'Full today')
  assert.equal(bayStatus({ time: null, day: null, free: 0, leftToday: 0 }), 'Full this week')
})
