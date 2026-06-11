'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/*
  Site-wide scroll-reveal driver.

  Any element carrying `data-reveal` is observed once and given `.is-in`
  when it enters the viewport (CSS in globals.css does the actual motion).

  Design constraints honoured here:
  - Content is never hidden before hydration: the `nv-motion` class on
    <html> is the arming switch, added only after mount, so no-JS visitors
    and the SSR snapshot always see fully visible content (no CLS, no SEO
    penalty).
  - One IntersectionObserver + one MutationObserver for the whole app —
    components opt in declaratively with an attribute, no per-component
    wiring or re-renders.
  - prefers-reduced-motion users never get armed at all.
*/
export default function RevealManager() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    const scan = () => {
      document
        .querySelectorAll('[data-reveal]:not(.is-in)')
        .forEach(el => io.observe(el))
    }

    /* Elements already in the viewport at arm-time must never flash:
       mark them .is-in synchronously before the hiding class lands. */
    const vh = window.innerHeight
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.top < vh && r.bottom > 0) el.classList.add('is-in')
    })

    document.documentElement.classList.add('nv-motion')
    scan()

    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
    // Re-run after client-side navigation so new pages get scanned fresh
  }, [pathname])

  return null
}
