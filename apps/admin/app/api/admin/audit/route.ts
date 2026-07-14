/**
 * GET /api/admin/audit?page=&action=&q=  — paginated admin action log.
 *
 * Super-admin only. Read-only view of every structural write (who did what,
 * when, from what IP) with before/after state.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@nova/database'
import { requireAdmin, AdminError } from '../../../../lib/mutation'

const PAGE_SIZE = 30

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (admin.scope !== 'all') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url    = new URL(req.url)
    const page   = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const action = (url.searchParams.get('action') || '').trim()
    const q      = (url.searchParams.get('q') || '').trim()
    const skip   = (page - 1) * PAGE_SIZE

    const where: any = {}
    if (action) where.action = action
    if (q) where.OR = [
      { entityType: { contains: q, mode: 'insensitive' } },
      { entityId:   { contains: q, mode: 'insensitive' } },
    ]

    const [rows, total, actions] = await Promise.all([
      prisma.adminActionLog.findMany({
        where, skip, take: PAGE_SIZE, orderBy: { createdAt: 'desc' },
        include: { admin: { select: { firstName: true, lastName: true, email: true } } },
      }),
      prisma.adminActionLog.count({ where }),
      prisma.adminActionLog.findMany({ distinct: ['action'], select: { action: true }, orderBy: { action: 'asc' } }),
    ])

    const safeParse = (s: string | null) => { if (!s) return null; try { return JSON.parse(s) } catch { return s } }

    const entries = rows.map(r => ({
      id: r.id,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      who: r.admin ? `${r.admin.firstName} ${r.admin.lastName}` : '—',
      email: r.admin?.email ?? '',
      ip: r.ipAddress ?? '—',
      before: safeParse(r.beforeState),
      after: safeParse(r.afterState),
      at: r.createdAt.toISOString(),
      when: r.createdAt.toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    }))

    return NextResponse.json({
      entries,
      actions: actions.map(a => a.action),
      pagination: { page, total, totalPages: Math.ceil(total / PAGE_SIZE), hasMore: page * PAGE_SIZE < total },
    })
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('[audit] error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
