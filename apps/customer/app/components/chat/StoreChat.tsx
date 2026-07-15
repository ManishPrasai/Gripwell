'use client'

/**
 * Store chat modal.
 *
 * Talks to /api/chat, which lands the message in the store's real admin inbox.
 * Works signed-out (the API issues a guest cookie on first send, so a guest who
 * returns later still sees the store's reply). Polls every 10s while open so a
 * staff reply appears without a refresh.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface Msg { id: string; side: 'inbound' | 'outbound'; text: string; time: string }

export default function StoreChat({
  storeSlug, storeName, onClose,
}: { storeSlug: string; storeName: string; onClose: () => void }) {
  const [msgs,    setMsgs]    = useState<Msg[]>([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    try {
      const r = await fetch(`/api/chat?storeSlug=${encodeURIComponent(storeSlug)}`)
      if (!r.ok) throw new Error()
      const d = await r.json()
      setMsgs(d.conversations?.[0]?.messages ?? [])
      setError(null)
    } catch {
      if (showSpinner) setError("Couldn't load your messages.")
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [storeSlug])

  useEffect(() => { load(true) }, [load])

  // Poll for staff replies while the window is open.
  useEffect(() => {
    const t = setInterval(() => load(false), 10000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [msgs])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true); setError(null)

    // Optimistic — show it immediately, reconcile from the server response.
    const temp: Msg = { id: 'tmp-' + Date.now(), side: 'outbound', text, time: new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }) }
    setMsgs(m => [...m, temp])
    setInput('')
    try {
      const r = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ storeSlug, body: text }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.error || 'Failed to send')
      setMsgs(m => m.map(x => (x.id === temp.id ? d.message : x)))
    } catch (e: any) {
      setMsgs(m => m.filter(x => x.id !== temp.id))   // roll back
      setInput(text)
      setError(e?.message || "Couldn't send. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const F = "'DM Sans', sans-serif"

  return createPortal(
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 16px' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Chat with ${storeName}`}
        style={{ width: '100%', maxWidth: 420, height: 'min(560px, 82vh)', background: '#fff', borderRadius: '16px 16px 12px 12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.28)' }}
      >
        {/* Header */}
        <div style={{ background: '#076330', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 800, fontSize: 12, flexShrink: 0 }}>NT</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeName}</div>
            <div style={{ fontFamily: F, fontSize: 11.5, opacity: 0.85 }}>Typically replies Mon–Fri, 8am–6pm</div>
          </div>
          <button onClick={onClose} aria-label="Close chat" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#F7F7F7' }}>
          {loading ? (
            <p style={{ fontFamily: F, fontSize: 13, color: '#888', textAlign: 'center', marginTop: 24 }}>Loading…</p>
          ) : msgs.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 28, padding: '0 16px' }}>
              <i className="ti ti-message-circle" style={{ fontSize: 30, color: '#CFCFCF' }} aria-hidden="true" />
              <p style={{ fontFamily: F, fontSize: 13.5, color: '#666', marginTop: 8, lineHeight: 1.5 }}>
                Send a message to <strong style={{ color: '#1A1A1A' }}>{storeName}</strong> — ask about stock, fitting times or a quote.
              </p>
            </div>
          ) : msgs.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.side === 'outbound' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              <div style={{ maxWidth: '78%' }}>
                <div style={{ background: m.side === 'outbound' ? '#076330' : '#fff', color: m.side === 'outbound' ? '#fff' : '#1A1A1A', padding: '9px 13px', borderRadius: m.side === 'outbound' ? '12px 12px 3px 12px' : '12px 12px 12px 3px', fontFamily: F, fontSize: 13.5, lineHeight: 1.45, border: m.side === 'outbound' ? 'none' : '1px solid #E5E5E5', wordBreak: 'break-word' }}>
                  {m.text}
                </div>
                <div style={{ fontFamily: F, fontSize: 10.5, color: '#9A9A9A', marginTop: 3, textAlign: m.side === 'outbound' ? 'right' : 'left' }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#FFF4F0', borderTop: '1px solid #FBD5C6', color: '#C0431B', fontFamily: F, fontSize: 12.5, padding: '8px 14px', flexShrink: 0 }}>{error}</div>
        )}

        {/* Composer */}
        <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #E5E5E5', background: '#fff', flexShrink: 0 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`Message ${storeName.replace(/^NOV\s?A TYRES\s?[–-]\s?/i, '')}…`}
            aria-label="Your message"
            style={{ flex: 1, minWidth: 0, border: '1px solid #D5D5D5', borderRadius: 8, padding: '10px 12px', fontFamily: F, fontSize: 13.5, outline: 'none' }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            aria-label="Send message"
            style={{ background: input.trim() && !sending ? '#E8572A' : '#E0E0E0', color: '#fff', border: 'none', borderRadius: 8, width: 42, cursor: input.trim() && !sending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s' }}
          >
            <i className="ti ti-send" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
