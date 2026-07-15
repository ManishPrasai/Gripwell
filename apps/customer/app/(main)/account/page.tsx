'use client'

import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import './account.css'

/* ── Icons ── */
const IUser   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IOrders = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
const IMsg    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const ILock   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IOut    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const ICheck  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const ISend   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IClose  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IWrench = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
const IFile   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const ICal    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IEdit   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
const IEmail  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>

/* ── Data ── */
interface UserData { firstName: string; lastName: string; email: string; phone: string | null; profileImage: string | null; createdAt: string }


const ORDERS = [
  { id: 'NV-20260612', title: '2 × Hankook Kinergy', vehicle: 'Customer Vehicle', date: '12 Jun 2026', location: 'Sefton', status: 'completed', amount: '$322', iconColor: 'green' as const, lines: [
    { label: 'Hankook Kinergy Eco 2 ×1', value: '$98.00' }, { label: 'Yokohama Geolandar A/T ×1', value: '$199.00' }, { label: 'Fitting & balancing', value: '$25.00' },
  ]},
]

const ICON_STYLES = {
  green:  { background: 'color-mix(in oklab, #076330 12%, transparent)', color: '#076330' },
  blue:   { background: 'color-mix(in oklab, #4285F4 12%, transparent)', color: '#4285F4' },
  accent: { background: 'color-mix(in oklab, #FF6817 12%, transparent)', color: '#FF6817' },
}

function nowTime() { const d = new Date(), h = d.getHours(), m = d.getMinutes(); return `${h % 12 || 12}:${m < 10 ? '0' : ''}${m} ${h < 12 ? 'AM' : 'PM'}` }

/* ── Modal ── */
function Modal({ type, onClose, onSuccess, email }: { type: string; onClose: () => void; onSuccess: () => void; email: string }) {
  const [done, setDone] = useState(false)
  const isDetails = type === 'details'
  useEffect(() => { const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; document.addEventListener('keydown', fn); return () => document.removeEventListener('keydown', fn) }, [onClose])

  return (
    <div className="acc-modal">
      <div className="acc-modal-bg" onClick={onClose} />
      <div className="acc-modal-card">
        <button className="acc-modal-close" onClick={onClose}><IClose /></button>
        {!done ? (<>
          <h3>{isDetails ? 'Request changes' : 'Reset password'}</h3>
          <p>{isDetails ? 'Tell us what to update — our team will verify and apply it within 1 business day.' : `We'll send a secure link to ${email}. Expires in 30 minutes.`}</p>
          {isDetails && (<>
            <div className="acc-mfield"><label>What would you like to change?</label><select defaultValue=""><option value="" disabled>Select a field…</option><option>Full name</option><option>Email address</option><option>Phone number</option><option>Suburb / postcode</option><option>Other</option></select></div>
            <div className="acc-mfield"><label>New value</label><input type="text" placeholder="Enter the updated information" /></div>
            <div className="acc-mfield"><label>Reason <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label><textarea placeholder="e.g. I've moved house / changed my number…" /></div>
          </>)}
          <div className="acc-mactions">
            <button className="btn-acc" style={{ flex: 1 }} onClick={() => setDone(true)}>{isDetails ? 'Submit request' : 'Send reset link'}</button>
            <button className="btn-acc ghost" onClick={onClose}>Cancel</button>
          </div>
        </>) : (
          <div className="acc-modal-success show">
            <div className="tick"><ICheck /></div>
            <h3>{isDetails ? 'Request sent' : 'Email sent'}</h3>
            <p>{isDetails ? "We'll update your details within 1 business day and confirm by email." : `Check your inbox at ${email} for the reset link.`}</p>
            <button className="btn-acc ghost" style={{ padding: '10px 24px' }} onClick={onSuccess}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Account Tab ── */
function AccountTab({ user, onRequest }: { user: UserData; onRequest: () => void }) {
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
  const fields = [
    { label: 'Full name', value: `${user.firstName} ${user.lastName}` },
    { label: 'Phone', value: user.phone || 'Not set' },
    { label: 'Email address', value: user.email },
    { label: 'Member since', value: memberSince },
  ]
  return (
    <div>
      <div className="acc-section-head"><h2>Account details</h2></div>
      <div className="acc-card">
        <div className="acc-fields">{fields.map(f => (<div className="acc-field" key={f.label}><label>{f.label}</label><div className="acc-field-val">{f.value}</div></div>))}</div>
        <div className="acc-divider" />
        <div className="acc-request-row">
          <p>To update your details, submit a request and our team will make the changes within 1 business day.</p>
          <button className="btn-acc ghost" style={{ padding: '11px 20px', fontSize: '13.5px', flexShrink: 0 }} onClick={onRequest}><IEdit /> Request changes</button>
        </div>
      </div>
    </div>
  )
}

/* ── Orders Tab ── */
function OrderItem({ order }: { order: typeof ORDERS[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`order-item${open ? ' open' : ''}`}>
      <button className="order-head" onClick={() => setOpen(!open)}>
        <div className="order-icon" style={ICON_STYLES[order.iconColor]}><IWrench /></div>
        <div><div className="order-title">{order.title} — {order.vehicle}</div><div className="order-meta">#{order.id} · {order.date} · {order.location}</div></div>
        <span className={`order-status ${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        <div className="order-amount">{order.amount}<small>incl. GST</small></div>
      </button>
      <div className="order-body"><div className="order-body-inner"><div className="order-body-pad">
        <div className="order-lines">{order.lines.map((l, i) => (<div className="order-line" key={i}><span>{l.label}</span><span>{l.value}</span></div>))}</div>
        <div className="order-acts"><button className="acc-btn-sm"><IFile /> Invoice</button><button className="acc-btn-sm primary"><ICal /> Book again</button></div>
      </div></div></div>
    </div>
  )
}
function OrdersTab() {
  return (<div><div className="acc-section-head"><h2>Recent orders</h2><span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-dim)' }}>{ORDERS.length} orders</span></div><div className="order-list">{ORDERS.map(o => <OrderItem key={o.id} order={o} />)}</div></div>)
}

/* ── Messages Tab ──
   Real conversations from /api/chat — messages land in the store's admin inbox
   and staff replies come back here (polled every 10s). */
function MessagesTab({ initials, token }: { initials: string; token: string | null }) {
  const [stores, setStores] = useState<{ id: string; slug: string; name: string; unread: number; messages: any[] }[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const msgsRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (spinner = false) => {
    if (spinner) setLoading(true)
    try {
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const [sRes, cRes] = await Promise.all([
        fetch('/api/stores').then(r => r.json()).catch(() => ({ stores: [] })),
        fetch('/api/chat', { headers }).then(r => r.json()).catch(() => ({ conversations: [] })),
      ])
      const convos: any[] = cRes.conversations ?? []
      // Show every store so a customer can open a new chat, and merge in any
      // existing thread. Stores they've already messaged sort first.
      const merged = (sRes.stores ?? []).map((s: any) => {
        const c = convos.find(x => x.storeId === s.id)
        return { id: s.id, slug: s.slug, name: s.name.replace(/^Nova Tyres\s+/i, ''), unread: c?.unread ?? 0, messages: c?.messages ?? [] }
      }).sort((a: any, b: any) => (b.messages.length ? 1 : 0) - (a.messages.length ? 1 : 0))
      setStores(merged)
      setActiveId(prev => prev ?? merged.find((s: any) => s.messages.length)?.id ?? merged[0]?.id ?? null)
    } catch {
      if (spinner) setError("Couldn't load your messages.")
    } finally {
      if (spinner) setLoading(false)
    }
  }, [token])

  useEffect(() => { load(true) }, [load])
  /* 30s, and only while the tab is visible — each poll builds a fresh
     PrismaClient + WASM engine server-side, so tight intervals stack memory. */
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) load(false) }, 30000)
    return () => clearInterval(t)
  }, [load])

  const active = stores.find(s => s.id === activeId) || stores[0]

  function selectStore(id: string) { setActiveId(id); setStores(prev => prev.map(s => s.id === id ? { ...s, unread: 0 } : s)) }

  async function send() {
    const text = input.trim(); if (!text || !active || sending) return
    setSending(true); setError(null)
    const temp = { id: 'tmp-' + Date.now(), side: 'outbound' as const, text, time: nowTime() }
    setStores(prev => prev.map(s => s.id === active.id ? { ...s, messages: [...s.messages, temp] } : s))
    setInput('')
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      const r = await fetch('/api/chat', { method: 'POST', headers, body: JSON.stringify({ storeSlug: active.slug, body: text }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'Failed to send')
      setStores(prev => prev.map(s => s.id === active.id ? { ...s, messages: s.messages.map(m => m.id === temp.id ? d.message : m) } : s))
    } catch (e: any) {
      setStores(prev => prev.map(s => s.id === active.id ? { ...s, messages: s.messages.filter(m => m.id !== temp.id) } : s))
      setInput(text)
      setError(e?.message || "Couldn't send. Please try again.")
    } finally { setSending(false) }
  }

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight }, [active?.messages])

  if (loading) return <div className="chat-wrap"><div className="chat-empty"><p>Loading your messages…</p></div></div>
  if (!active)  return <div className="chat-wrap"><div className="chat-empty"><p>No stores available right now.</p></div></div>

  let lastDay: string | null = null
  const msgNodes = active.messages.map(msg => {
    const m = msg as typeof msg & { day?: string }
    const showDay = m.day && m.day !== lastDay; if (m.day) lastDay = m.day
    return (<Fragment key={msg.id}>{showDay && <div className="chat-day-sep">{m.day}</div>}<div className={`chat-msg ${msg.side}`}><div className="chat-msg-av">{msg.side === 'inbound' ? 'NT' : initials}</div><div className="chat-msg-body"><div className="chat-bubble">{msg.text}</div><div className="chat-time">{msg.time}</div></div></div></Fragment>)
  })
  const totalUnread = stores.reduce((n, s) => n + (s.id !== activeId ? s.unread : 0), 0)

  return (
    <div>
      <div className="acc-section-head"><h2>Messages</h2>{totalUnread > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-dim)' }}>{totalUnread} unread</span>}</div>
      <div className="chat-wrap">
        <div className="chat-header"><div className="chat-agent-av">NT</div><div><div className="chat-agent-name">Nova Tyres — {active.name}</div><div className="chat-agent-status">Typically replies Mon–Fri, 8 AM–6 PM</div></div></div>
        <div className="chat-stores">{stores.map(store => (<button key={store.id} className={`chat-store-btn${activeId === store.id ? ' active' : ''}`} onClick={() => selectStore(store.id)}><span className="chat-store-dot" />{store.name}{store.unread > 0 && <span className="chat-store-unread">{store.unread}</span>}</button>))}</div>
        <div className="chat-messages" ref={msgsRef}>{msgNodes.length === 0 ? (<div className="chat-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><p>No messages with {active.name} yet — send one below.</p></div>) : msgNodes}</div>
        {error && <div style={{ padding: '8px 14px', background: '#FFF4F0', color: '#C0431B', fontSize: '12.5px', fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}
        <div className="chat-input-row"><input type="text" className="chat-input" placeholder={`Message ${active.name}…`} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} /><button className="chat-send" onClick={send} disabled={sending || !input.trim()}><ISend /></button></div>
      </div>
    </div>
  )
}

/* ── Security Tab ── */
function SecurityTab({ email, onResetPw, onRequest }: { email: string; onResetPw: () => void; onRequest: () => void }) {
  const items = [
    { cls: 'pw', icon: <ILock />, title: 'Password', desc: `Receive a secure reset link at ${email}. Valid for 30 minutes.`, btnLabel: 'Send reset link', btnIcon: <IEmail />, action: onResetPw },
    { cls: 'id', icon: <IUser />, title: 'Personal details change', desc: 'Update your name, email address, phone number or suburb. Verified within 1 business day.', btnLabel: 'Request changes', btnIcon: <IEdit />, action: onRequest },
  ]
  return (
    <div><div className="acc-section-head"><h2>Password &amp; security</h2></div><div className="sec-list">{items.map(item => (
      <div className="sec-item" key={item.title}><div className={`sec-ico ${item.cls}`}>{item.icon}</div><div className="sec-body"><div className="sec-title">{item.title}</div><div className="sec-desc">{item.desc}</div></div>
        <button className="btn-acc ghost" style={{ padding: '10px 18px', fontSize: '13.5px', flexShrink: 0 }} onClick={item.action}>{item.btnIcon} {item.btnLabel}</button></div>
    ))}</div></div>
  )
}

/* ── Sidebar ── */
function Sidebar({ tab, setTab, user, msgUnread }: { tab: string; setTab: (t: string) => void; user: UserData; msgUnread: number }) {
  const router = useRouter()
  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()
  const navItems = [
    { id: 'account', label: 'Account details', icon: <IUser />, badge: null },
    { id: 'orders', label: 'Orders', icon: <IOrders />, badge: ORDERS.length },
    { id: 'messages', label: 'Messages', icon: <IMsg />, badge: msgUnread || null },
    { id: 'security', label: 'Password & security', icon: <ILock />, badge: null },
  ]
  async function handleSignOut() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }

  return (
    <aside className="acc-sidebar">
      <div className="acc-id-card">
        <div className="acc-avatar">
          {user.profileImage ? <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} referrerPolicy="no-referrer" /> : initials}
        </div>
        <div className="acc-id-card-info">
          <div className="acc-name">{user.firstName} {user.lastName}</div>
          <div className="acc-email">{user.email}</div>
        </div>
      </div>
      <nav className="acc-nav">
        {navItems.map(item => (<button key={item.id} className={`acc-nav-item${tab === item.id ? ' active' : ''}`} onClick={() => setTab(item.id)}>{item.icon}{item.label}{item.badge ? <span className="acc-nav-badge">{item.badge}</span> : null}</button>))}
        <button className="acc-nav-item signout" onClick={handleSignOut}><IOut /> Sign out</button>
      </nav>
    </aside>
  )
}

/* ── Main ── */
export default function AccountPage() {
  const router = useRouter()
  const [tab, setTab] = useState('account')
  const [modal, setModal] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  /* Kept so the Messages tab can call /api/chat as this customer — without it
     the API would treat them as an anonymous guest. */
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/refresh', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (!data.accessToken) { router.push('/login?from=/account'); return }
        setToken(data.accessToken)
        return fetch('/api/auth/me', { headers: { Authorization: `Bearer ${data.accessToken}` } }).then(r => r.json())
      })
      .then(data => { if (data?.customer) setUser(data.customer) })
      .catch(() => router.push('/login?from=/account'))
      .finally(() => setLoading(false))
  }, [router])

  /* Real unread count for the sidebar badge — store replies awaiting the customer.
     Only polled while the Messages tab is closed (that tab does its own, fresher
     fetch), and paused when the tab is hidden, to keep Worker load down. */
  const [msgUnread, setMsgUnread] = useState(0)
  useEffect(() => {
    if (!token || tab === 'messages') return
    const poll = () => {
      if (document.hidden) return
      fetch('/api/chat', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setMsgUnread((d.conversations ?? []).reduce((n: number, c: any) => n + (c.unread || 0), 0)))
        .catch(() => {})
    }
    poll()
    const t = setInterval(poll, 60000)
    return () => clearInterval(t)
  }, [token, tab])

  function showToast(msg: string) { setToast(msg); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2800) }

  if (loading) return <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', fontFamily: "'DM Sans', sans-serif", color: '#5E7268' }}>Loading your account…</div>
  if (!user) return null

  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()

  return (
    <>
      <div className="acc-wrap">
        <Sidebar tab={tab} setTab={setTab} user={user} msgUnread={msgUnread} />
        <div className="acc-main">
          {tab === 'account' && <AccountTab user={user} onRequest={() => setModal('details')} />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'messages' && <MessagesTab initials={initials} token={token} />}
          {tab === 'security' && <SecurityTab email={user.email} onResetPw={() => setModal('password')} onRequest={() => setModal('details')} />}
        </div>
      </div>
      {modal && <Modal type={modal} email={user.email} onClose={() => setModal(null)} onSuccess={() => { setModal(null); showToast(modal === 'details' ? 'Change request submitted' : 'Reset link sent to your email') }} />}
      <div className={`acc-toast${toast ? ' show' : ''}`}><ICheck /><span>{toast}</span></div>
    </>
  )
}
