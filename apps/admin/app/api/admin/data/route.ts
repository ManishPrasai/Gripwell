/**
 * GET /api/admin/data
 *
 * Single consolidated endpoint that returns all dashboard data.
 * STORE_MANAGER responses are scoped to their assigned store.
 * SUPER_ADMIN receives cross-store aggregates.
 *
 * Returns a shape that mirrors the NOVA mock data so the client pages
 * can do `const D = ctx.D || NOVA` with zero structure changes.
 */
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@nova/database'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')

export async function GET(req: NextRequest) {
  try {
    /* Auth */
    const token = req.cookies.get('admin_access_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { payload } = await jwtVerify(token, secret).catch(() => ({ payload: null }))
    if (!payload || payload.type !== 'admin') return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const role    = payload.role as string
    const storeId = payload.storeId as string | undefined
    const isManager = role === 'STORE_MANAGER'

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart); todayEnd.setDate(todayStart.getDate() + 1)

    /* ── Fetch everything at once ────────────────────────────────────────────
       These queries are all independent — only the mapping below depends on
       their results. Running them sequentially cost ~13 round trips to
       Postgres (~5.7s); one Promise.all collapses that to roughly the slowest
       single query. Selects are explicit rather than `include: true` so we
       don't drag every column across the wire on each 20s poll. */
    const [
      storesRaw, revByStore, staffByStore, todayByStore, staffRaw,
      tyresRaw, wheelsRaw, ordersRaw, apptRaw, reviewsRaw,
      convsRaw, enquiriesRaw, seoRaw, rolesRaw, discountsRaw,
    ] = await Promise.all([
      prisma.store.findMany({
        where: isManager ? { id: storeId } : undefined,
        select: {
          id: true, name: true, suburb: true, state: true, isActive: true, phone: true,
          hours: { where: { dayOfWeek: 'Monday' }, select: { dayOfWeek: true, openTime: true, closeTime: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.order.groupBy({ by: ['storeId'], _sum: { total: true } }),
      prisma.adminUser.groupBy({ by: ['storeId'], where: { isActive: true, deletedAt: null }, _count: { _all: true } }),
      prisma.appointment.groupBy({ by: ['storeId'], where: { date: { gte: todayStart, lt: todayEnd } }, _count: { _all: true } }),
      prisma.adminUser.findMany({
        where: isManager ? { storeId } : undefined,
        select: {
          id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true,
          store: { select: { name: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.tyre.findMany({
        where: { deletedAt: null },
        select: {
          id: true, brand: true, model: true, price: true, stockQuantity: true, isActive: true,
          tyreSize: { select: { width: true, profile: true, rimDiameter: true } },
          images: { select: { url: true }, take: 1 },
        },
        orderBy: { brand: 'asc' },
        take: 500,
      }),
      prisma.wheel.findMany({
        where: { deletedAt: null },
        select: {
          id: true, brand: true, model: true, price: true, stockQuantity: true, isActive: true,
          diameter: true, width: true, pcd: true, offset: true,
          images: { select: { url: true }, take: 1 },
        },
        orderBy: { brand: 'asc' },
        take: 500,
      }),
      prisma.order.findMany({
        where: isManager ? { storeId } : undefined,
        select: {
          id: true, total: true, status: true, paymentStatus: true, stripePaymentIntentId: true, createdAt: true,
          // Skip the 'fitting' service line — it has no tyre/wheel, and when it
          // sorted first the Orders page rendered a useless "Item ×1".
          items: {
            where: { itemType: { not: 'fitting' } },
            select: { quantity: true, tyre: { select: { brand: true, model: true } }, wheel: { select: { brand: true, model: true } } },
            take: 3,
          },
          customer: { select: { firstName: true, lastName: true, email: true } },
          store: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      prisma.appointment.findMany({
        where: isManager ? { storeId } : undefined,
        select: {
          id: true, notes: true, status: true, date: true, timeSlot: true,
          service: { select: { name: true, priceFrom: true } },
          store: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true, phone: true } },
        },
        orderBy: { date: 'desc' },
        take: 200,
      }),
      prisma.review.findMany({
        where: isManager ? { storeId } : undefined,
        select: {
          id: true, storeId: true, rating: true, body: true, reply: true, isVerifiedPurchase: true, createdAt: true,
          customer: { select: { firstName: true, lastName: true } },
          store: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      prisma.chatConversation.findMany({
        where: isManager ? { storeId } : undefined,
        select: {
          id: true, status: true, createdAt: true,
          messages: { select: { body: true, senderType: true, isRead: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
          store: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.enquiry.findMany({
        where: isManager ? { source: storeId } : undefined,
        select: {
          id: true, name: true, phone: true, type: true, message: true, status: true, createdAt: true,
          store: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.pageSEO.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.role.findMany({
        select: {
          id: true, name: true, description: true, color: true, scope: true, permissions: true, isBuiltIn: true,
          _count: { select: { admins: true } },
        },
        orderBy: [{ isBuiltIn: 'desc' }, { createdAt: 'asc' }],
      }),
      prisma.discount.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])
    const revMap = new Map(revByStore.map(r => [r.storeId, Number(r._sum.total ?? 0)]))
    const staffMap = new Map(staffByStore.filter(r => r.storeId).map(r => [r.storeId as string, r._count._all]))
    const todayMap = new Map(todayByStore.map(r => [r.storeId, r._count._all]))
    const stores = storesRaw.map(s => {
      const mon = s.hours.find(h => h.dayOfWeek === 'Monday')
      return {
        id: s.id, name: s.name, suburb: s.suburb, state: s.state,
        status: s.isActive ? 'open' : 'closed',
        phone: s.phone, manager: s.name,
        mgrInit: s.name.split(' ').map(w => w[0]).join('').slice(0, 2),
        mgrAv: '#076330', rating: 4.8, reviews: 250,
        today: todayMap.get(s.id) ?? 0,
        capacity: Math.min(100, Math.round(((todayMap.get(s.id) ?? 0) / 16) * 100)),
        bays: 4, staff: staffMap.get(s.id) ?? 0,
        revenue: Math.round(revMap.get(s.id) ?? 0),
        opens: mon?.openTime ?? '08:00', closes: mon?.closeTime ?? '17:30',
      }
    })

    /* ── Staff (AdminUsers) ── */
    const staff = staffRaw.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Store Manager',
      store: u.store?.name ?? 'All Stores',
      status: 'online',
      email: u.email,
      init: `${u.firstName[0]}${u.lastName[0]}`,
      av: '#076330',
      phone: '—',
      since: u.createdAt.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
    }))

    /* ── Inventory (tyres + wheels) ── */
    const LOW_THRESHOLD = 8
    const products = [
      ...tyresRaw.map(t => ({
        id: t.id, name: `${t.brand} ${t.model}`, cat: 'Tyres',
        spec: t.tyreSize
          ? `${t.tyreSize.width}/${t.tyreSize.profile}R${t.tyreSize.rimDiameter}`
          : '—',
        brand: t.brand, price: Number(t.price),
        stock: t.stockQuantity, low: LOW_THRESHOLD,
        status: t.isActive ? 'active' : 'draft', icon: 'tyre',
        image: t.images[0]?.url,
      })),
      ...wheelsRaw.map(w => ({
        id: w.id, name: `${w.brand} ${w.model}`, cat: 'Wheels',
        spec: `${w.diameter}×${w.width} ${w.pcd}${w.offset != null ? ` ET${w.offset}` : ''}`,
        brand: w.brand, price: Number(w.price),
        stock: w.stockQuantity, low: 4,
        status: w.isActive ? 'active' : 'draft', icon: 'wheel',
        image: w.images[0]?.url,
      })),
    ]

    /* ── Orders ── */
    const orders = ordersRaw.map(o => ({
      id: o.id,
      ref: `#${o.id.slice(0, 6).toUpperCase()}`,
      customer: `${o.customer.firstName} ${o.customer.lastName}`,
      email: o.customer.email,
      items: o.items.map(i => i.tyre ? `${i.tyre.brand} ${i.tyre.model} ×${i.quantity}` : i.wheel ? `${i.wheel.brand} ${i.wheel.model} ×${i.quantity}` : `Item ×${i.quantity}`).join(', '),
      total: Number(o.total),
      source: 'order',
      status: o.status.toLowerCase(),
      paymentStatus: o.paymentStatus.toLowerCase(),
      hasStripe: !!o.stripePaymentIntentId,
      store: o.store?.name ?? '—',
      date: o.createdAt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
    }))

    /* ── Bookings (Appointments) ── */
    const bookings = apptRaw.map(a => ({
      id: a.id,
      ref: `NV-${a.id.slice(0, 4).toUpperCase()}`,
      customer: `${a.customer.firstName} ${a.customer.lastName}`,
      vehicle: a.notes ?? '—',
      service: a.service.name,
      mech: 'TBA', mInit: 'TB', mAv: '#0EA5A5',
      store: a.store.name,
      status: a.status.toLowerCase() === 'confirmed' ? 'pending' : a.status.toLowerCase(),
      time: `${a.date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })} · ${a.timeSlot}`,
      price: Number(a.service.priceFrom),
      phone: a.customer.phone ?? '—',
    }))

    /* ── Reviews ── */
    const reviews = reviewsRaw.map(r => ({
      id: r.id,
      storeId: r.storeId,
      author: `${r.customer.firstName} ${r.customer.lastName.slice(0, 1)}.`,
      init: `${r.customer.firstName[0]}${r.customer.lastName[0]}`,
      av: '#FF6817',
      store: r.store?.name ?? '—',
      rating: r.rating,
      time: r.createdAt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      text: r.body ?? '',
      reply: r.reply ?? null,
      verified: r.isVerifiedPurchase,
    }))

    /* ── Messages (ChatConversations) ── */
    const conversations = convsRaw.map(c => ({
      id: c.id,
      customer: c.customer ? `${c.customer.firstName} ${c.customer.lastName}` : 'Guest',
      init: c.customer ? `${c.customer.firstName[0]}${c.customer.lastName[0]}` : 'G',
      av: '#076330',
      store: c.store.name,
      status: c.status === 'active' ? 'open' : 'closed',
      unread: c.messages.filter(m => !m.isRead && m.senderType === 'CUSTOMER').length,
      time: `${Math.round((Date.now() - c.createdAt.getTime()) / 60000)}m`,
      agent: null as string | null,
      topic: c.messages[0]?.body?.slice(0, 50) ?? 'Conversation',
      messages: c.messages.map(m => ({
        from: m.senderType === 'CUSTOMER' ? 'customer' : 'store',
        text: m.body,
        time: m.createdAt.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }),
      })),
    }))

    /* ── Calls/Enquiries ── */
    const calls = enquiriesRaw.map((e, i) => ({
      id: e.id,
      customer: e.name,
      phone: e.phone,
      init: e.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      av: ['#076330','#2D6BE0','#D6336C','#E08600','#7048E8'][i % 5],
      store: e.store?.name ?? '—',
      kind: e.type === 'general' ? 'enquiry' : e.type,
      topic: e.message.slice(0, 50),
      time: e.createdAt.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }),
      duration: '—',
      outcome: e.status === 'NEW' ? 'callback' : e.status === 'IN_PROGRESS' ? 'thinking' : 'resolved',
      handledBy: '—',
      note: e.message,
    }))

    /* ── Website pages (PageSEO) ── */
    const pages = seoRaw.map((p) => ({
      id: p.id,                          // real PageSEO id — used by PATCH /api/admin/seo/[id]
      title: p.entityId ?? p.entityType,
      url: p.entityId === 'home' ? '/' : `/${p.entityId}`,
      status: 'published',
      edited: p.updatedAt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      by: 'Admin',
      views: '—',
      icon: 'page',
      seo: 80,
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc ?? '',
      ogImage: p.ogImage ?? '',
      kw: '',
    }))

    /* ── Revenue (last 7 days from orders) ── */
    const revenue7: { d: string; a: number; b: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const dayOrders = ordersRaw.filter(o => {
        const od = new Date(o.createdAt)
        return od.getDate() === day.getDate() && od.getMonth() === day.getMonth()
      })
      const total = dayOrders.reduce((s, o) => s + Number(o.total), 0)
      revenue7.push({
        d: day.toLocaleDateString('en-AU', { weekday: 'short' }),
        a: Math.round(total),
        b: dayOrders.length,
      })
    }

    /* ── Roles (with live member counts) ── */
    const roles = rolesRaw.map(r => ({
      id: r.id, name: r.name, desc: r.description ?? '', color: r.color ?? '#0EA5A5',
      scope: r.scope, members: r._count.admins, locked: r.isBuiltIn,
      perms: (r.permissions ?? {}) as Record<string, number>,
    }))

    /* ── Discount codes ── */
    const discounts = discountsRaw.map(d => ({
      id: d.id, code: d.code, type: d.type, value: Number(d.value),
      minOrderAmount: d.minOrderAmount ? Number(d.minOrderAmount) : null,
      maxUses: d.maxUses, currentUses: d.currentUses,
      expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
      active: d.isActive,
    }))

    /* ── Activity feed ── */
    const activity = [
      ...(bookings.slice(0, 2).map(b => ({ type: 'booking', who: b.customer, what: `booked ${b.service}`, store: b.store, time: 'recently' }))),
      ...(reviews.slice(0, 2).map(r => ({ type: 'review', who: r.author, what: `left a ${r.rating}★ review`, store: r.store, time: r.time }))),
      ...(orders.slice(0, 2).map(o => ({ type: 'order', who: o.customer, what: `placed order ${o.ref}`, store: o.store, time: o.date }))),
    ].slice(0, 7)

    return NextResponse.json({
      stores, staff, products, orders, bookings, reviews,
      conversations, calls, pages, revenue7, activity,
      notifications: [],
      roles, discounts, blogs: [], sectionTypes: {}, pageSections: {},
      permAreas: [], pageSEO: seoRaw,
    })

  } catch (err) {
    console.error('admin/data error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
