'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function scorePassword(pw: string): number {
  if (!pw) return 0
  let cats = 0
  if (/[a-z]/.test(pw)) cats++
  if (/[A-Z]/.test(pw)) cats++
  if (/[0-9]/.test(pw)) cats++
  if (/[^A-Za-z0-9]/.test(pw)) cats++
  if (pw.length >= 8 && cats >= 3) return 3
  if (pw.length >= 6 && cats >= 2) return 2
  return 1
}

const GRAY = '#E2E8F0', RED = '#E5484D', AMBER = '#F59E0B', GREEN = '#22A565'
const STRENGTH_COLORS = ['', RED, AMBER, GREEN]
const STRENGTH_LABELS = ['', 'Weak', 'Medium', 'Strong']

const input: React.CSSProperties = {
  width: '100%', height: '54px', padding: '0 18px',
  fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 500,
  color: '#111', background: '#F8FAFC', border: '1px solid #E2E8F0',
  borderRadius: '12px', outline: 'none',
  transition: 'background .18s ease, border-color .18s ease, box-shadow .18s ease',
}

export default function AuthPageWrapper() {
  return <Suspense><AuthPage /></Suspense>
}

function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/'

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [showPw, setShowPw] = useState(false)
  const [pw, setPw] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignup = tab === 'signup'
  const level = scorePassword(pw)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    try {
      if (isSignup) {
        const firstName = form.get('firstName') as string
        const lastName = form.get('lastName') as string
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Registration failed'); return }
        router.push(from)
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Login failed'); return }
        router.push(from)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', background: '#fff' }}>

      {/* ── Left panel: branding ── */}
      <section style={{
        position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px', minHeight: '100vh',
        backgroundColor: '#08401F',
        backgroundImage: 'radial-gradient(120% 80% at 85% 8%, rgba(232,87,42,0.28) 0%, rgba(232,87,42,0) 42%), linear-gradient(158deg, #0c5128 0%, #08401F 46%, #042513 100%)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(125deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 26px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
            <div style={{ width: '30px', height: '30px', background: '#fff', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '11px', height: '11px', border: '3px solid #E8572A', borderRadius: '50%' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.16em', color: '#fff' }}>NOVA TYRES</span>
          </Link>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)',
            backdropFilter: 'blur(8px)', color: '#fff', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none',
          }}>
            Back to website
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>

        <div style={{ position: 'relative', maxWidth: '460px' }}>
          <h2 style={{ margin: 0, fontSize: '44px', lineHeight: 1.04, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
            Walk in.<br />Drive out sharper.
          </h2>
          <p style={{ margin: '18px 0 30px', maxWidth: '400px', fontSize: '15.5px', lineHeight: 1.55, color: 'rgba(255,255,255,0.7)' }}>
            Precision tyres, expert fitting, and bookings that move at the speed of your day.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ width: '26px', height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.28)' }} />
            <span style={{ width: '26px', height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.28)' }} />
            <span style={{ width: '40px', height: '5px', borderRadius: '999px', background: '#E8572A' }} />
          </div>
        </div>
      </section>

      {/* ── Right panel: form ── */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 64px', background: '#fff' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px' }}>

          <h1 style={{ margin: '0 0 30px', textAlign: 'center', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.01em', color: '#111' }}>
            {isSignup ? 'Create an account' : 'Sign in to Nova Tyres'}
          </h1>

          {/* Error */}
          {error && (
            <div style={{ background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#C62828', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Name fields (signup) */}
          {isSignup && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <input name="firstName" type="text" placeholder="First name" autoComplete="given-name" required style={input} />
              <input name="lastName" type="text" placeholder="Last name" autoComplete="family-name" required style={input} />
            </div>
          )}

          {/* Email */}
          <input name="email" type="email" placeholder="Email" autoComplete="email" required style={{ ...input, marginBottom: '14px' }} />

          {/* Password */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              name="password" type={showPw ? 'text' : 'password'} placeholder="Password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required minLength={6}
              value={pw} onChange={e => setPw(e.target.value)}
              style={{ ...input, paddingRight: '52px' }}
            />
            <button type="button" onClick={() => setShowPw(s => !s)} aria-label="Toggle password"
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
              {showPw ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 10 8 10 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><path d="M1 1l22 22M6.61 6.61A18.4 18.4 0 002 12s3 8 10 8a9.1 9.1 0 005.39-1.61" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>

          {/* Password strength (signup) */}
          {isSignup && pw.length > 0 && (
            <div style={{ margin: '-2px 0 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '9px' }}>
                <span style={{ height: '4px', borderRadius: '999px', background: level >= 1 ? RED : GRAY, transition: 'background .2s ease' }} />
                <span style={{ height: '4px', borderRadius: '999px', background: level >= 2 ? AMBER : GRAY, transition: 'background .2s ease' }} />
                <span style={{ height: '4px', borderRadius: '999px', background: level >= 3 ? GREEN : GRAY, transition: 'background .2s ease' }} />
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.01em', color: STRENGTH_COLORS[level] }}>{STRENGTH_LABELS[level]}</span>
            </div>
          )}

          {/* Remember me / Forgot password (signin) */}
          {!isSignup && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
                <input type="checkbox" style={{ width: '17px', height: '17px', borderRadius: '4px', accentColor: '#08401F', cursor: 'pointer' }} />
                Remember me
              </label>
              <Link href="#" style={{ fontSize: '13.5px', fontWeight: 600, color: '#08401F', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
          )}

          {/* Terms (signup) */}
          {isSignup && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '22px', fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
              <input type="checkbox" required style={{ width: '17px', height: '17px', borderRadius: '4px', accentColor: '#08401F', cursor: 'pointer' }} />
              <span>I agree to the <Link href="/warranty" style={{ color: '#08401F', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms &amp; Conditions</Link></span>
            </label>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: '100%', height: '54px', background: '#E8572A', color: '#fff', border: 'none',
            borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '15.5px', fontWeight: 700,
            letterSpacing: '0.01em', cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 6px 18px rgba(232,87,42,0.3)', opacity: loading ? 0.7 : 1,
            transition: 'background .16s ease, transform .08s ease, box-shadow .16s ease',
          }}>
            {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '22px 0' }}>
            <span style={{ flex: 1, height: '1px', background: '#E8ECEF' }} />
            <span style={{ fontSize: '12.5px', color: '#94A3B8', fontWeight: 500 }}>{isSignup ? 'Or register with' : 'Or login with'}</span>
            <span style={{ flex: 1, height: '1px', background: '#E8ECEF' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: isSignup ? '1fr 1fr' : '1fr', gap: '12px' }}>
            <button type="button" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '50px',
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: '14.5px', fontWeight: 600, color: '#111',
              transition: 'background .16s ease, border-color .16s ease',
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 110-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1024 44c11 0 20-8.9 20-20 0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0124 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 006.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0124 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2C39.6 36 44 30.7 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
              Google
            </button>
            <button type="button" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '50px',
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: '14.5px', fontWeight: 600, color: '#111',
              transition: 'background .16s ease, border-color .16s ease',
            }}>
              <svg width="16" height="18" viewBox="0 0 24 24" fill="#111"><path d="M17.05 12.04c-.02-2.13 1.74-3.15 1.82-3.2-.99-1.45-2.54-1.65-3.09-1.67-1.32-.13-2.57.77-3.24.77-.66 0-1.69-.75-2.78-.73-1.43.02-2.75.83-3.49 2.11-1.49 2.58-.38 6.4 1.07 8.49.71 1.02 1.56 2.17 2.66 2.13 1.07-.04 1.47-.69 2.77-.69 1.29 0 1.65.69 2.78.67 1.15-.02 1.88-1.04 2.58-2.07.81-1.19 1.15-2.34 1.17-2.4-.03-.01-2.24-.86-2.26-3.41zM14.9 5.57c.59-.72.99-1.71.88-2.71-.85.03-1.88.57-2.49 1.28-.55.63-1.03 1.64-.9 2.61.95.07 1.92-.48 2.51-1.18z" /></svg>
              Apple
            </button>
          </div>

          {/* Switch tab */}
          <p style={{ margin: '26px 0 0', textAlign: 'center', fontSize: '14px', color: '#64748B', fontWeight: 400 }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={() => { setTab(isSignup ? 'signin' : 'signup'); setError(null); setPw('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: '#E8572A', padding: '0 0 0 4px' }}>
              {isSignup ? 'Log in' : 'Sign Up now'}
            </button>
          </p>

        </form>
      </section>

      {/* Mobile: hide left panel */}
      <style>{`
        @media (max-width: 880px) {
          section:first-of-type { display: none !important; }
          div:has(> section) { grid-template-columns: 1fr !important; }
          section:last-of-type { padding: 56px 28px !important; }
        }
      `}</style>
    </div>
  )
}
