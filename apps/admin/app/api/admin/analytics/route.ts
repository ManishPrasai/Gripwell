/**
 * GET /api/admin/analytics?range=7|30|90
 *
 * Real revenue & conversion metrics from Orders + Appointments. Store managers
 * are scoped to their own store; super admins see all stores.
 *
 * NOTE: revenue here is WEBSITE order revenue (the Order table). In-store/POS
 * revenue across the 9 stores is a separate data-capture project.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'
import { requireAdmin, AdminError } from '../../../../lib/mutation'

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    const storeScope = admin.scope === 'all' ? undefined : admin.storeId
    if (admin.scope !== 'all' && !storeScope) {
      return NextResponse.json({ error: 'No store assigned' }, { status: 403 })
    }

    const range = Math.min(365, Math.max(1, parseInt(new URL(req.url).searchParams.get('range') || '30', 10)))
    const now = new Date()
    const start = new Date(now); start.setDate(now.getDate() - range + 1); start.setHours(0, 0, 0, 0)
    const prevStart = new Date(start); prevStart.setDate(start.getDate() - range)

    const orderWhere = (from: Date, to?: Date) => ({
      createdAt: { gte: from, ...(to ? { lt: to } : {}) },
      ...(storeScope ? { storeId: storeScope } : {}),
    })

    const [orders, prevOrders, appts, stores] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere(start),
        select: {
          id: true, total: true, storeId: true, createdAt: true, status: true,
          store: { select: { name: true } },
          items: { select: { itemType: true, quantity: true, totalPrice: true, tyre: { select: { brand: true, model: true } }, wheel: { select: { brand: true, model: true } } } },
        },
      }),
      prisma.order.findMany({ where: orderWhere(prevStart, start), select: { total: true } }),
      prisma.appointment.findMany({ where: { date: { gte: start }, ...(storeScope ? { storeId: storeScope } : {}) }, select: { status: true } }),
      prisma.store.findMany({ where: storeScope ? { id: storeScope } : { isActive: true }, select: { id: true, name: true } }),
    ])

    /* ── KPIs ── */
    const revenue = orders.reduce((s, o) => s + Number(o.total), 0)
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0)
    const orderCount = orders.length
    const avgOrder = orderCount ? revenue / orderCount : 0
    const bookings = appts.length
    const completed = appts.filter(a => a.status === 'COMPLETED').length
    const conversion = bookings ? Math.round((completed / bookings) * 100) : 0
    const revDelta = prevRevenue ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : (revenue > 0 ? 100 : 0)

    /* ── Revenue by day ── */
    const byDayMap = new Map<string, number>()
    for (let i = 0; i < range; i++) { const d = new Date(start); d.setDate(start.getDate() + i); byDayMap.set(dayKey(d), 0) }
    for (const o of orders) {
      const k = dayKey(new Date(o.createdAt))
      if (byDayMap.has(k)) byDayMap.set(k, (byDayMap.get(k) || 0) + Number(o.total))
    }
    const revenueByDay = Array.from(byDayMap.entries()).map(([day, rev]) => ({
      day: new Date(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      revenue: Math.round(rev),
    }))

    /* ── Revenue by store ── */
    const storeAgg = new Map<string, { name: string; revenue: number; orders: number }>()
    for (const s of stores) storeAgg.set(s.id, { name: s.name, revenue: 0, orders: 0 })
    for (const o of orders) {
      const row = storeAgg.get(o.storeId) || { name: o.store?.name ?? '—', revenue: 0, orders: 0 }
      row.revenue += Number(o.total); row.orders += 1
      storeAgg.set(o.storeId, row)
    }
    const byStore = Array.from(storeAgg.values()).sort((a, b) => b.revenue - a.revenue).map(r => ({ ...r, revenue: Math.round(r.revenue) }))

    /* ── Top products ── */
    const prodAgg = new Map<string, { units: number; revenue: number }>()
    for (const o of orders) for (const it of o.items) {
      if (it.itemType === 'fitting') continue
      const name = it.tyre ? `${it.tyre.brand} ${it.tyre.model}` : it.wheel ? `${it.wheel.brand} ${it.wheel.model}` : 'Product'
      const row = prodAgg.get(name) || { units: 0, revenue: 0 }
      row.units += it.quantity; row.revenue += Number(it.totalPrice)
      prodAgg.set(name, row)
    }
    const topProducts = Array.from(prodAgg.entries())
      .map(([name, v]) => ({ name, units: v.units, revenue: Math.round(v.revenue) }))
      .sort((a, b) => b.revenue - a.revenue).slice(0, 8)

    /* ── Orders by status ── */
    const ordersByStatus: Record<string, number> = {}
    for (const o of orders) ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1

    return NextResponse.json({
      range,
      kpis: {
        revenue: Math.round(revenue), revenueDelta: revDelta,
        orders: orderCount, avgOrder: Math.round(avgOrder),
        bookings, conversion,
      },
      revenueByDay, byStore, topProducts, ordersByStatus,
    })
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[analytics] error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
