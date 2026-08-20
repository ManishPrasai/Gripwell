/**
 * Customer-facing chat with a store.
 *
 *   GET  /api/chat            → every conversation for the current identity
 *   GET  /api/chat?storeId=x  → one store's conversation + messages
 *   POST /api/chat            → send a message (creates the conversation on first send)
 *
 * Identity is either a logged-in customer (Bearer access token, same pattern as
 * /api/auth/me) or a guest tracked by an httpOnly cookie. The schema supports
 * both via ChatConversation.customerId / .guestSessionId, so a guest who comes
 * back later still sees the store's reply.
 *
 * Messages written here use senderType 'CUSTOMER' — that's what the admin
 * console counts as unread and renders on the left of the thread.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma, verifyAccessToken } from '@nova/database'

const GUEST_COOKIE = 'nova_guest_session'
const GUEST_MAX_AGE = 60 * 60 * 24 * 365   // 1 year

// Keyed by public store slug — the storefront never handles internal UUIDs.
const SendSchema = z.object({
  storeSlug: z.string().min(1),
  body:      z.string().trim().min(1, 'Message cannot be empty').max(4000),
})

type Identity =
  | { kind: 'customer'; customerId: string }
  | { kind: 'guest';    guestSessionId: string; isNew: boolean }

/** Resolve the caller: logged-in customer if a valid token is present, else guest. */
function resolveIdentity(req: NextRequest): Identity {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (token) {
    const payload = verifyAccessToken(token)
    if (payload && payload.type === 'customer') return { kind: 'customer', customerId: payload.id }
  }
  const existing = req.cookies.get(GUEST_COOKIE)?.value
  if (existing) return { kind: 'guest', guestSessionId: existing, isNew: false }
  return { kind: 'guest', guestSessionId: crypto.randomUUID(), isNew: true }
}

/** Where-clause matching only this caller's conversations. */
function identityWhere(id: Identity) {
  return id.kind === 'customer'
    ? { customerId: id.customerId }
    : { guestSessionId: id.guestSessionId }
}

const shapeMessage = (m: { id: string; senderType: string; body: string; createdAt: Date }) => ({
  id:   m.id,
  side: m.senderType === 'CUSTOMER' ? 'outbound' : 'inbound',
  text: m.body,
  time: m.createdAt.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }),
  day:  m.createdAt.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
  at:   m.createdAt.toISOString(),
})

/* ── GET ──────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const identity = resolveIdentity(req)

    // A brand-new guest has no history — don't mint a cookie just for a read.
    if (identity.kind === 'guest' && identity.isNew) {
      return NextResponse.json({ conversations: [] })
    }

    const storeSlug = new URL(req.url).searchParams.get('storeSlug')

    const convos = await prisma.chatConversation.findMany({
      where: { ...identityWhere(identity), ...(storeSlug ? { store: { slug: storeSlug } } : {}) },
      include: {
        store:    { select: { id: true, name: true, slug: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Opening a store's thread marks the store's replies as seen.
    if (storeSlug && convos.length) {
      await prisma.chatMessage.updateMany({
        where: { conversationId: convos[0].id, senderType: { not: 'CUSTOMER' }, isRead: false },
        data:  { isRead: true, readAt: new Date() },
      })
    }

    return NextResponse.json({
      conversations: convos.map(c => ({
        id:       c.id,
        storeId:  c.storeId,
        store:    c.store.name,
        slug:     c.store.slug,
        status:   c.status,
        unread:   c.messages.filter(m => m.senderType !== 'CUSTOMER' && !m.isRead).length,
        messages: c.messages.map(shapeMessage),
      })),
    })
  } catch (e) {
    console.error('[chat] GET error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

/* ── POST ─────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const identity = resolveIdentity(req)
    const parsed = SendSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid message' }, { status: 400 })
    }
    const { storeSlug, body } = parsed.data

    const store = await prisma.store.findFirst({
      where:  { slug: storeSlug, isActive: true, deletedAt: null },
      select: { id: true, name: true },
    })
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    // One open conversation per (identity, store) — reuse it so the thread reads
    // as one continuous history rather than fragmenting per message.
    let convo = await prisma.chatConversation.findFirst({
      where:  { ...identityWhere(identity), storeId: store.id },
      select: { id: true },
    })
    if (!convo) {
      convo = await prisma.chatConversation.create({
        data: {
          storeId: store.id,
          status: 'active',
          ...(identity.kind === 'customer'
            ? { customerId: identity.customerId }
            : { guestSessionId: identity.guestSessionId }),
        },
        select: { id: true },
      })
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: convo.id,
        senderType:     'CUSTOMER',
        senderId:       identity.kind === 'customer' ? identity.customerId : identity.guestSessionId,
        body,
        isRead:         false,   // unread for the store until staff open it
      },
      select: { id: true, senderType: true, body: true, createdAt: true },
    })

    // Bump the conversation so it sorts to the top of the store's inbox.
    await prisma.chatConversation.update({
      where: { id: convo.id },
      data:  { status: 'active', updatedAt: new Date() },
    })

    const res = NextResponse.json({
      success: true,
      conversationId: convo.id,
      message: shapeMessage(message),
    })

    if (identity.kind === 'guest') {
      res.cookies.set(GUEST_COOKIE, identity.guestSessionId, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path:     '/',
        maxAge:   GUEST_MAX_AGE,
      })
    }
    return res
  } catch (e) {
    console.error('[chat] POST error:', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
