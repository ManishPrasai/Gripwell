import type { ReactNode } from 'react'
import Link from 'next/link'

/* Plain reading layout for the demo store's legal pages. */
export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#FAF9F5', padding: '56px 20px 80px', color: '#1A1D23' }}>
      <style>{`
        .legal { max-width: 68ch; margin: 0 auto; font-size: 16px; line-height: 1.65; }
        .legal h1 { font-size: clamp(30px, 4vw, 42px); line-height: 1.1; margin: 0 0 16px; }
        .legal h2 { font-size: 20px; margin: 36px 0 8px; }
        .legal p, .legal li { color: #3D4148; }
        .legal ul { padding-left: 20px; }
        .legal a { color: #1A1D23; font-weight: 700; }
        .legal .demo { border: 1px solid #E7E5DE; background: #fff; border-radius: 10px; padding: 14px 16px; margin: 0 0 28px; color: #1A1D23; }
      `}</style>
      <article className="legal">
        <h1>{title}</h1>
        <p className="demo">
          <strong>Demo store.</strong> Gripwell is a portfolio project, not a real business. No goods are sold or fitted,
          and payments run in Stripe test mode, so no real money moves. This page describes how the demo behaves.
        </p>
        {children}
        <p style={{ marginTop: 40 }}><Link href="/">Back to the shop</Link></p>
      </article>
    </main>
  )
}
