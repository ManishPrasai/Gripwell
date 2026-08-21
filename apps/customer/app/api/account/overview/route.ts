/*
 * Everything the account dashboard renders, in one round trip: the customer's
 * garage, their service history, their orders and the headline stats derived
 * from those.
 *
 * Identity is a Bearer access token, the same pattern as /api/auth/me.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma, verifyAccessToken } from '@nova/database'

const HISTORY_LIMIT = 12
const ORDER_LIMIT   = 20

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 })

    const payload = verifyAccessToken(token)
    if (!payload || payload.type !== 'customer') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
    const customerId = payload.id

    const [vehicles, appointments, orders, reviewAgg] = await Promise.all([
      prisma.customerVehicle.findMany({
        where:   { customerId },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true, regoPlate: true, regoState: true, nickname: true, isPrimary: true,
          vehicle: { select: { make: true, model: true, year: true, variant: true, bodyType: true } },
        },
      }),

      prisma.appointment.findMany({
        where:   { customerId },
        orderBy: { date: 'desc' },
        take:    HISTORY_LIMIT,
        select: {
          id: true, date: true, timeSlot: true, status: true, notes: true,
          store:   { select: { name: true, suburb: true } },
          service: { select: { name: true } },
          customerVehicle: {
            select: { nickname: true, vehicle: { select: { make: true, model: true } } },
          },
        },
      }),

      prisma.order.findMany({
        where:   { customerId },
        orderBy: { createdAt: 'desc' },
        take:    ORDER_LIMIT,
        select: {
          id: true, status: true, total: true, paymentStatus: true, createdAt: true,
          store: { select: { name: true, suburb: true } },
          /* An order line points at exactly one of tyre/wheel/package/service,
             so the display name is resolved from whichever relation is set. */
          items: {
            select: {
              id: true, itemType: true, quantity: true, unitPrice: true, totalPrice: true,
              tyre:    { select: { brand: true, model: true } },
              wheel:   { select: { brand: true, model: true } },
              package: { select: { name: true } },
              service: { select: { name: true } },
            },
          },
        },
      }),

      prisma.review.aggregate({
        where: { customerId },
        _avg:  { rating: true },
        _count: { rating: true },
      }),
    ])

    /* "Services done" counts only appointments that actually happened, so a
       cancelled or still-pending booking never inflates the number. */
    const servicesDone = appointments.filter(a => a.status === 'COMPLETED').length

    const garage = vehicles.map(cv => ({
      id:       cv.id,
      name:     cv.nickname || `${cv.vehicle.make} ${cv.vehicle.model}`,
      make:     cv.vehicle.make,
      model:    cv.vehicle.model,
      year:     cv.vehicle.year,
      variant:  cv.vehicle.variant,
      bodyType: cv.vehicle.bodyType,
      rego:     cv.regoPlate ? `${cv.regoPlate}${cv.regoState ? ` · ${cv.regoState}` : ''}` : null,
      isPrimary: cv.isPrimary,
    }))

    const history = appointments.map(a => ({
      id:      a.id,
      date:    a.date,
      status:  a.status,
      service: a.service.name,
      store:   a.store.suburb || a.store.name,
      vehicle: a.customerVehicle
        ? a.customerVehicle.nickname || `${a.customerVehicle.vehicle.make} ${a.customerVehicle.vehicle.model}`
        : null,
      notes:   a.notes,
    }))

    const orderList = orders.map(o => ({
      id:        o.id,
      status:    o.status,
      payment:   o.paymentStatus,
      total:     Number(o.total),
      createdAt: o.createdAt,
      store:     o.store.suburb || o.store.name,
      items: o.items.map(i => ({
        id:   i.id,
        type: i.itemType,
        name: i.tyre    ? `${i.tyre.brand} ${i.tyre.model}`
            : i.wheel   ? `${i.wheel.brand} ${i.wheel.model}`
            : i.package ? i.package.name
            : i.service ? i.service.name
            : i.itemType,
        qty:        i.quantity,
        unitPrice:  Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
    }))

    return NextResponse.json({
      garage,
      history,
      orders: orderList,
      stats: {
        servicesDone,
        vehicles:    garage.length,
        orders:      orderList.length,
        /* null rather than 0 so the UI can say "—" instead of implying a 0-star average */
        avgRating:   reviewAgg._count.rating > 0 ? Number(reviewAgg._avg.rating?.toFixed(1)) : null,
        reviewCount: reviewAgg._count.rating,
      },
    })
  } catch (error) {
    console.error('Account overview error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
