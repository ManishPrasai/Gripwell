/**
 * Smoothly scroll a section to just below the fixed navbar.
 *
 * Why not scrollIntoView / scroll-behavior:smooth? The service page has
 * `content-visibility: auto` sections above the target. Their real height only
 * materialises as they enter the viewport, so a one-shot scroll computes the
 * target's position from ESTIMATED heights and then drifts — which is why the
 * animation was overshooting past the heading down to the first store.
 *
 * This re-reads the target's live position every frame and eases toward it, so
 * any layout shift during the scroll is continuously corrected. It also works in
 * both directions: from above it scrolls down, from within/below it scrolls up.
 */
export function smoothScrollToSection(id: string, opts: { offset?: number; maxMs?: number } = {}) {
  if (typeof window === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return

  const offset = opts.offset ?? 88          // clears the fixed navbar
  const maxMs = opts.maxMs ?? 1600          // safety cap
  const start = performance.now()
  let raf = 0

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const align = () => window.scrollBy(0, el.getBoundingClientRect().top - offset)

  if (reduce) { align(); return }

  const tick = (now: number) => {
    const remaining = el.getBoundingClientRect().top - offset   // live, re-read each frame
    if (Math.abs(remaining) <= 1 || now - start > maxMs) {
      align()                                                   // final exact snap
      return
    }
    window.scrollBy(0, remaining * 0.16)                        // ease toward it (exp. approach)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
