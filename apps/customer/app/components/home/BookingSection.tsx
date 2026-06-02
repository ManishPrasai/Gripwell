'use client'

import { useState } from 'react'

/* ── Static data ─────────────────────────────────────────────────────────── */

const STORES = [
  'Springvale', 'Dandenong', 'Melbourne (Alphington)',
  'Bayswater', 'Sunshine', 'Geelong', 'Sefton', 'Brisbane', 'Adelaide',
]

const SERVICES = [
  'Free Pre-RWC Check', 'Free Safety Inspection',
  'Log Book Service', 'Yearly Service',
  '3 Year Service', '6 Year Service', 'Ultimate Service',
]

/* Business hours: 9 AM – 5 PM, every 30 min (last slot 16:30) */
const ALL_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30',
]

const GROUPS = [
  { label: 'Morning',        icon: 'ti-sun',      slots: ALL_SLOTS.filter(t => t < '12:00') },
  { label: 'Afternoon',      icon: 'ti-cloud-sun', slots: ALL_SLOTS.filter(t => t >= '12:00' && t < '15:00') },
  { label: 'Late Afternoon', icon: 'ti-clock',     slots: ALL_SLOTS.filter(t => t >= '15:00') },
]

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getNext7Days() {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return {
      dateStr:   d.toISOString().split('T')[0],
      label:     i === 0 ? 'Today' : DAY_NAMES[d.getDay()],
      dayNum:    String(d.getDate()),
      monthAbbr: MONTH_NAMES[d.getMonth()],
      isToday:   i === 0,
      weekday:   d.getDay(),
    }
  })
}

/* Deterministic mock bookings keyed by weekday — gives consistent UI for demo */
const MOCK_BOOKED: Record<number, string[]> = {
  1: ['09:00','09:30','14:00'],              // Mon
  2: ['10:00','11:00','15:00','15:30'],       // Tue
  3: ['11:00','11:30','13:00'],              // Wed
  4: ['12:00','12:30','16:00','16:30'],       // Thu
  6: ['09:00','10:30','14:00','16:00'],       // Sat
}

function getMockBooked(weekday: number): Set<string> {
  return new Set(MOCK_BOOKED[weekday] ?? [])
}

function isPastSlot(dateStr: string, slot: string): boolean {
  const todayStr = new Date().toISOString().split('T')[0]
  if (dateStr !== todayStr) return false
  const now = new Date()
  const [h, m] = slot.split(':').map(Number)
  /* Require at least 60 min lead time */
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes() + 60
}

function fmt12(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function BookingSection() {
  const [store,          setStore]          = useState('')
  const [service,        setService]        = useState('')
  const [time,           setTime]           = useState('')
  const [pickerOpen,     setPickerOpen]     = useState(false)
  const [selectedDate,   setSelectedDate]   = useState('')
  const [selectedSlot,   setSelectedSlot]   = useState('')

  const days   = getNext7Days()
  const locked = !store || !service

  /* Open picker: default to today if no date chosen yet */
  function handleTimeClick() {
    if (!pickerOpen && !selectedDate) setSelectedDate(days[0].dateStr)
    setPickerOpen(v => !v)
  }

  function handleDateSelect(dateStr: string) {
    setSelectedDate(dateStr)
    setSelectedSlot('')   // clear slot highlight when switching days
  }

  function handleSlotSelect(slot: string) {
    const day = days.find(d => d.dateStr === selectedDate)
    if (!day) return
    const d     = new Date(selectedDate)
    const label = day.isToday
      ? `Today — ${fmt12(slot)}`
      : `${day.label} ${day.dayNum} ${MONTH_NAMES[d.getMonth()]} — ${fmt12(slot)}`
    setTime(label)
    setSelectedSlot(slot)   // highlight chosen chip; picker stays open
  }

  /* Current day's booked set */
  const dayObj      = days.find(d => d.dateStr === selectedDate)
  const bookedSlots = dayObj ? getMockBooked(dayObj.weekday) : new Set<string>()

  return (
    <section
      className="relative py-16 px-4 overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          bottom: '-350px',
          backgroundImage: 'url(/images/tyres-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          opacity: 0.55,
          filter: 'blur(4px)',
          transform: 'scale(1.06) translateY(-350px)',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.48)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        <p className="uppercase tracking-widest mb-4"
          style={{ color: '#E8572A', letterSpacing: '0.15em', fontSize: '12px', fontWeight: 500 }}>
          1 Minute Booking
        </p>

        <h2 className="mb-2 leading-tight"
          style={{ color: 'white', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '0.02em' }}>
          <em style={{ color: '#E8572A', fontStyle: 'italic' }}>Walk in.</em>{' '}Drive out sharper.
        </h2>
        <p className="mb-8" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: 400 }}>
          Pick a store, pick a slot, confirm booking.
        </p>

        {/* ── Booking card ── */}
        <div className="rounded-2xl p-4 md:p-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>

          {/* Three input fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

            {/* Store */}
            <div className="text-left">
              <label className="block uppercase tracking-wide mb-1.5"
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
                Store
              </label>
              <select
                value={store}
                onChange={e => setStore(e.target.value)}
                className="w-full rounded-lg px-3 py-3 outline-none appearance-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: store ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '15px', fontWeight: 400 }}
              >
                <option value="" style={{ background: '#1a1a1a' }}>Select store...</option>
                {STORES.map(s => (
                  <option key={s} value={s} style={{ background: '#1a1a1a', color: 'white' }}>{s}</option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div className="text-left">
              <label className="block uppercase tracking-wide mb-1.5"
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>
                Service
              </label>
              <select
                value={service}
                onChange={e => setService(e.target.value)}
                className="w-full rounded-lg px-3 py-3 outline-none appearance-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: service ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '15px', fontWeight: 400 }}
              >
                <option value="" style={{ background: '#1a1a1a' }}>Select service...</option>
                {SERVICES.map(s => (
                  <option key={s} value={s} style={{ background: '#1a1a1a', color: 'white' }}>{s}</option>
                ))}
              </select>
            </div>

            {/* Time — custom button trigger */}
            <div className="text-left">
              <label className="block uppercase tracking-wide mb-1.5"
                style={{ color: locked ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500, transition: 'color 0.2s' }}>
                Time
              </label>
              <button
                type="button"
                onClick={handleTimeClick}
                className="w-full rounded-lg px-3 py-3 text-left flex items-center justify-between"
                style={{
                  background:  locked ? 'rgba(255,255,255,0.04)' : pickerOpen ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.08)',
                  border:      `1px solid ${pickerOpen && !locked ? '#E8572A' : locked ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.15)'}`,
                  color:       time ? 'white' : locked ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.4)',
                  fontSize:    '15px',
                  fontWeight:  400,
                  cursor:      locked ? 'not-allowed' : 'pointer',
                  transition:  'all 0.2s',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {time || 'Select time...'}
                </span>
                <i className={`ti ${pickerOpen && !locked ? 'ti-chevron-up' : 'ti-clock'} ml-2 flex-shrink-0`}
                  style={{ fontSize: '14px', opacity: 0.55 }} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* ── Dependency-lock hint ── */}
          {pickerOpen && locked && (
            <div className="flex items-center gap-3 rounded-xl mb-4"
              style={{ background: 'rgba(232,87,42,0.07)', border: '1px solid rgba(232,87,42,0.18)', padding: '12px 16px' }}>
              <i className="ti ti-lock flex-shrink-0" style={{ color: '#E8572A', fontSize: '16px' }} aria-hidden="true" />
              <p className="text-left" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: 400 }}>
                Please select a <strong style={{ color: '#fff', fontWeight: 600 }}>Store</strong> and{' '}
                <strong style={{ color: '#fff', fontWeight: 600 }}>Service</strong> before choosing a time slot.
              </p>
            </div>
          )}

          {/* ── Time picker panel ── */}
          {pickerOpen && !locked && (
            <div className="rounded-xl mb-4 text-left overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>

              {/* Day strip */}
              <div className="flex gap-2 overflow-x-auto"
                style={{ padding: '14px 14px 12px', scrollbarWidth: 'none' }}>
                {days.map(day => {
                  const booked    = getMockBooked(day.weekday)
                  const available = ALL_SLOTS.some(s => !booked.has(s) && !isPastSlot(day.dateStr, s))
                  const isSelected = selectedDate === day.dateStr
                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      disabled={!available}
                      onClick={() => handleDateSelect(day.dateStr)}
                      style={{
                        flexShrink:    0,
                        minWidth:      '58px',
                        display:       'flex',
                        flexDirection: 'column',
                        alignItems:    'center',
                        padding:       '8px 10px',
                        borderRadius:  '10px',
                        background:    isSelected ? '#E8572A' : !available ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                        border:        `1px solid ${isSelected ? '#E8572A' : !available ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                        cursor:        !available ? 'not-allowed' : 'pointer',
                        opacity:       !available ? 0.35 : 1,
                        transition:    'all 0.18s',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)', marginBottom: '3px' }}>
                        {day.label}
                      </span>
                      <span style={{ fontSize: '19px', fontWeight: 700, lineHeight: 1, color: isSelected ? '#fff' : !available ? 'rgba(255,255,255,0.3)' : '#fff' }}>
                        {day.dayNum}
                      </span>
                      <span style={{ fontSize: '10px', color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                        {day.monthAbbr}
                      </span>
                      {!available && (
                        <span style={{ marginTop: '4px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(255,100,100,0.65)' }}>
                          FULL
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 14px' }} />

              {/* Time slot groups */}
              <div style={{ padding: '14px' }}>
                {GROUPS.map(group => {
                  const slotsWithState = group.slots.map(slot => ({
                    slot,
                    booked: bookedSlots.has(slot),
                    past:   isPastSlot(selectedDate, slot),
                  }))
                  const anyAvailable = slotsWithState.some(s => !s.booked && !s.past)

                  return (
                    <div key={group.label} className="mb-5 last:mb-0">
                      {/* Group header */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <i className={`ti ${group.icon}`} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }} aria-hidden="true" />
                        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                          {group.label}
                        </span>
                        {!anyAvailable && (
                          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255,100,100,0.55)', marginLeft: '2px' }}>
                            — No slots available
                          </span>
                        )}
                      </div>

                      {/* Slot chips */}
                      <div className="flex flex-wrap gap-2">
                        {slotsWithState.map(({ slot, booked, past }) => {
                          const unavailable = booked || past
                          const isChosen    = selectedSlot === slot
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={unavailable}
                              onClick={() => !unavailable && handleSlotSelect(slot)}
                              style={{
                                padding:        '6px 13px',
                                borderRadius:   '8px',
                                fontSize:       '13px',
                                fontWeight:     isChosen ? 600 : 500,
                                cursor:         unavailable ? 'not-allowed' : 'pointer',
                                background:     isChosen ? '#E8572A'
                                              : booked   ? 'rgba(255,255,255,0.03)'
                                              : past     ? 'transparent'
                                              :             'rgba(255,255,255,0.09)',
                                border:         `1px solid ${isChosen ? '#E8572A'
                                                           : booked   ? 'rgba(255,255,255,0.06)'
                                                           : past     ? 'rgba(255,255,255,0.04)'
                                                           :             'rgba(255,255,255,0.14)'}`,
                                color:          isChosen ? '#fff'
                                              : booked   ? 'rgba(255,255,255,0.18)'
                                              : past     ? 'rgba(255,255,255,0.14)'
                                              :             'rgba(255,255,255,0.85)',
                                textDecoration: booked ? 'line-through' : 'none',
                                position:       'relative',
                                transition:     'all 0.15s',
                              }}
                            >
                              {fmt12(slot)}
                              {booked && (
                                <span style={{
                                  position: 'absolute', top: '-7px', right: '-3px',
                                  fontSize: '8px', fontWeight: 700, letterSpacing: '0.03em',
                                  background: 'rgba(255,80,80,0.12)', color: 'rgba(255,100,100,0.65)',
                                  borderRadius: '4px', padding: '1px 4px',
                                }}>
                                  FULL
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 flex-wrap"
                style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { bg: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.14)', label: 'Available' },
                  { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)', label: 'Booked'    },
                  { bg: 'transparent',            border: 'rgba(255,255,255,0.04)', label: 'Past'       },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.bg, border: `1px solid ${item.border}` }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            className="w-full text-white py-4 rounded-xl uppercase tracking-wide transition-opacity hover:opacity-90"
            style={{ background: '#E8572A', letterSpacing: '0.08em', fontSize: '14px', fontWeight: 600 }}
          >
            Call to Book
          </button>

          <p className="mt-3" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 500 }}>
            Or call us directly on{' '}
            <a href="tel:1300897337" style={{ color: '#E8572A' }}>1300 TYRES</a>
            {' '}— Mon–Sat 8am–6pm AEST
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          {['Pick your tyre & size', 'Choose place & time', 'We fit it on the spot'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: '#E8572A', fontSize: '11px', fontWeight: 500 }}>
                {i + 1}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 500 }}>{step}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
