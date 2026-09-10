# HANDOFF — shared session log

> Read this at the START of every session. UPDATE it before you finish.
> Both the VS Code extension Claude Code and the terminal Claude Code share this file.
> Keep it short and current. Delete stale notes. Convert relative dates to absolute.

---

## Current focus
**Mobile redesign** on branch `task2-parallel`, in the `nova-tyres-task2` git worktree.
Approach: keep every desktop page 100% untouched; render a separate mobile design on
the same route; `globals.css` toggles `[data-vw]` by viewport width at 1024px.
Done: **homepage** (`/`), **Find Tyres** (`/tyres`), **Find Wheels** (`/wheels`), **Service** (`/service`).
Testable on localhost:3002 (was :3000); **uncommitted** as of 2026-09-08.
Design source of truth = live DesignSync project `ad6984e8-…` ("Navbar search bar
options"), NOT the stale `Downloads\Navbar search bar options (3)` folder.

## Branch / worktree / state
- Worktree: `C:\Users\Manish Prasai\Desktop\Nova Tyres\nova-tyres-task2`, branch `task2-parallel`, base commit `9842d1e`.
- Env in this worktree: `apps/customer/.env.local` + `packages/database/.env` present (enough for `apps/customer` dev). Full env backup at `E:\NovaTyres ENV\` (see its README) if admin/root env is ever needed.
- Pre-existing uncommitted work on this branch (visual polish, separate from the mobile redesign): `BrowseByCategory.tsx` rewrite, `service/page.tsx` brands marquee, `BestDeals.tsx` + `InStoreServices.tsx` background tweaks.

## What's been done this session (2026-09-07, terminal CLI)
Dual-tree responsive split for the homepage — **desktop design is byte-for-byte unchanged**:
- **`app/globals.css`** — added the `[data-vw]` toggle: `@media (max-width:1023.98px){[data-vw="desktop"]{display:none}}` + mirror at `min-width:1024px` for `[data-vw="mobile"]`. Pure CSS, no JS, no user-agent detection → page stays one cacheable response, switch is instant on resize (DevTools included).
- **`app/(main)/page.tsx`** — wraps existing sections in `<div data-vw="desktop">`, adds `<div data-vw="mobile"><MobileHome/></div>`, and renders a scoped `<style>` that hides `.nv-shared-chrome` below 1024px **on the homepage only** (unmounts on navigation, so other pages keep Navbar/Footer at all widths).
- **`app/(main)/layout.tsx`** — wrapped `<Navbar/>` and `<Footer/>` each in `<div className="nv-shared-chrome">`.
- **New `app/components/home/mobile/`**
  - `MobileHome.tsx` — server component, the whole phone homepage. Centred 480px column (`.nv-mob-shell`) on a dark backdrop so tablet widths don't stretch. Real data: `lib/stores`, the 9-brand list from `BrandsStrip`.
  - `MobileHeader.tsx` — `'use client'`, green bar + live cart-count badge (`useCart`).
  - `MobileFindTyre.tsx` — `'use client'`, hero "Find My Tyre" → width/profile/rim → `/tyres/results?width=…`.
  - `MobileDealsRail.tsx` — `'use client'`, fetches the same `/api/tyres/featured` + `/api/wheels/featured` feed as desktop `BestDeals`, horizontal snap rail.
  - `MobileServicesList.tsx` — `'use client'`, tap-to-expand services accordion.
- **New `app/components/layout/mobile/MobileTabBar.tsx`** — `'use client'`, fixed 5-tab bottom nav (Home/Shop/Search/Cart/Account), width-capped 480px centred, active tab from `usePathname`, cart-count badge.

**Verified** with Playwright screenshots at 1440 / 1024 / 1023 / 820 / 390px against `localhost:3000`:
- ≥1024px → existing desktop homepage, unchanged.
- ≤1023px → mobile design; shared Navbar/Footer gone; bottom tab bar fixed, footer clears it.
- 768–1023px → centred 480px column, no stretch.
- Clean switch at the 1024/1023 boundary. No console errors, `GET / 200`, featured API `200`.

## Update 2026-09-08 (terminal CLI)
- **Pulled the live Claude Design** (`/design-login` + DesignSync, project `ad6984e8-2bdf-4fc1-b47b-f86e1ca937db` "Navbar search bar options"). The local `Downloads\Navbar search bar options (3)` folder (Sep 7 12:06) was **stale** — the live `Mobile Hero - Find My Tyre.dc.html` has a redesigned hero trust-pill section. Only that block changed vs. what was built; all other sections match.
- `MobileFindTyre.tsx` — hero trust pills rebuilt to the **live** design: a horizontal-scroll pill row (`.nv-mob-pills`, added to `MobileHome.tsx` scoped `<style>`), rounded 999px chips on `rgba(0,0,0,.35)`, each = circular icon badge + two-line label:
  - `4.8 on Google` / `1,240+ reviews` — real multicolour Google "G" on white circle
  - `${STORES.length} stores` / `${STORE_STATES_SERVED.length} states` — white pin on orange circle (counts live from `lib/stores`)
  - `Price beaten` / `on any written quote` — tag icon on translucent-white circle
  (superseded the earlier 3-up grid attempt that copied desktop `HeroSection.tsx`.)
- Verified: `GET / 200`, clean compile, pill text in SSR HTML.
- **Bottom-nav Shop/Search now match the artboard** (were plain links to `/tyres` and `/tyres/results`). The `.dc.html` models them as in-page views (`goShop` → `view:'shop'`). Implemented as a full-height overlay (z 70, between header z 60 and tab bar z 80) driven by `useState` in `MobileTabBar.tsx`; body scroll locked while open:
  - New `app/components/home/mobile/MobileShopView.tsx` — 2×2 hub (Find Tyres `/tyres`, Find Wheels `/wheels`, Service `/service`, Warranty `/warranty`) + "More" list (Store locations `/service?goto=shops`, Warranty details `/warranty`).
  - New `app/components/home/mobile/MobileSearchView.tsx` — search field + recent chips, all real links into `/tyres/results`.
  - `MobileTabBar.tsx` — Home/Shop/Search are now `<button>` (view toggles), Cart/Account stay `<Link>`. Overlay renders its own `<MobileHeader/>` so the green bar stays. Homepage-only, like the rest of the mobile tree.
- **"Find a store" map added** (the artboard's 240px "map with pins" panel above the branch list was missing from the port). New `app/components/home/mobile/MobileStoreMap.tsx` — `next/dynamic(ssr:false)` wrapper around the app's canonical `components/locations/StoreMap` (Google Maps via `@vis.gl/react-google-maps`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`). Feeds all 7 `lib/stores` as pins; muted basemap; lazy so it costs the desktop tree nothing. Rendered in `MobileHome.tsx` between the "Find a store" heading and the branch-list card; section top padding restored `4px`→`24px` to match the artboard.
- **Map is a non-interactive preview** (the "ctrl + scroll to zoom" overlay was the desktop face of `gestureHandling:'cooperative'`). `StoreMap` got a new optional `interactive` prop (default `true`, backward-compatible for the desktop locator); `false` sets `gestureHandling:'none'`, no zoom control, no keyboard shortcuts. `MobileStoreMap` passes `interactive={false}` and overlays a transparent full-panel `<Link href="/service?goto=shops">`, so a tap opens the full locator and the map never traps page scroll. The visible "View all N locations →" link still sits just below the panel in `MobileHome`.
- **Branch list shows all 7 stores** (was `STORES.slice(0, 4)`). `MobileHome.tsx`: `storeList = STORES`; the white card is now `.nv-mob-vscroll` (`max-height:256px`, slim 4px scrollbar, `overscroll-behavior:contain`) so ~5 rows show and the rest scroll inside the card. "View all 7 locations →" link unchanged below.
- `tsc --noEmit` clean; `GET / 200`; map container in SSR HTML (map JS loads client-side after hydration, by design); all 7 store rows in the mobile tree HTML.
- **`/tyres` mobile design ported** ("Mobile Find Tyres" artboard, pulled live from DesignSync). Same dual-tree split as the homepage:
  - `app/(main)/tyres/page.tsx` — existing `<main>` wrapped in `<div data-vw="desktop">` (untouched), new `<div data-vw="mobile"><MobileFindTyres/></div>`, scoped `@media (max-width:1023.98px){.nv-shared-chrome{display:none!important}}`.
  - New `app/components/tyres/mobile/MobileFindTyres.tsx` (server) — hero "Our Tyre Collection"; "Shop by tyre type" rail (4 real `TyreType` links, same as desktop `ShopByTyreType`); "Brands we serve" (5 logo tiles + "+75 more" → `/tyres/results`); "Find a store" rail (all 7 `lib/stores`, storefront photo or green initials placeholder, `tel:` button); FAQ; shared footer + tab bar.
  - New `app/components/tyres/mobile/MobileFindTyresFaq.tsx` (client) — 4-item accordion, same copy as desktop `TyreFAQ`.
  - The artboard's `TYRES` product array is unused in its own markup, so no product grid on the mobile landing (matches the artboard). Desktop `TyreInfoBar` has no mobile equivalent — omitted, per artboard.
- **Refactors this brought:**
  - Mobile helper CSS (`nvMobFade`, `.nv-mob-press`, `.nv-mob-rail`, `.nv-mob-pills`, `.nv-mob-vscroll`) moved from `MobileHome.tsx`'s scoped `<style>` into `globals.css` (one copy, `.nv-mob-*` scoped, no existing rule changed) so both mobile pages share it.
  - Condensed dark footer extracted to `app/components/layout/mobile/MobileFooter.tsx`; `MobileHome` now renders `<MobileFooter/>`.
  - `MobileTabBar` gained an optional `active?: 'home'|'shop'|'search'` prop (default `'home'`) for the resting highlight; `MobileFindTyres` passes `active="shop"`. `MobileHome`'s `<MobileTabBar/>` unchanged.
- `tsc --noEmit` clean; `GET / 200`, `GET /tyres 200`; both `data-vw` trees in `/tyres` SSR HTML; homepage footer/animations still fine after the CSS move.
- **Fixes after review:**
  - Bottom-nav **Home** was a dead `<button onClick={setOverlay(null)}>` — did nothing on non-home routes. Now `<Link href="/">` (still clears any open overlay). Shop/Search stay overlay buttons; Cart/Account stay links.
  - **`MobileFooter` rebuilt to the full artboard footer** (was a 3-line stub). Now: brand + tagline, "Connect with us" (real FB/IG/LinkedIn URLs from desktop `Footer.tsx`), "Quick Links", "Our Stores" (all 7 `lib/stores`), "About Nova Tyres" paragraph, divider, `© {year}` + legal links (`/warranty` `/privacy` `/terms`). Shared by both mobile pages.
  - **Cream gap between footer and tab bar removed.** `.nv-mob-shell` had `padding-bottom:62px` (cream `#FAF9F5`) reserving space for the fixed tab bar. Moved that clearance onto `MobileFooter`'s `padding-bottom` (`calc(22px + 62px + env(safe-area-inset-bottom))`) so the dark `#002A13` fills down to the tab bar; dropped `paddingBottom` from both shell divs.
- Dev server for this review ran on **:3002** (`cd apps/customer && npx next dev --port 3002`).

## Update 2026-09-08 (cont.) — `/wheels`
- **`/wheels` mobile design** built in the same language as `/tyres` (no artboard exists for it — adapted from `MobileFindTyres`). Dual-tree split in `app/(main)/wheels/page.tsx` (desktop `<main>` untouched, wrapped).
  - New `app/components/wheels/mobile/MobileFindWheels.tsx` (server) — hero "Our Wheel Collection"; Featured wheels; "Brands we serve" (4 wheel logos + "+more"); shared store rail; FAQ; footer + tab bar (`active="shop"`). (A "Shop by finish" swatch rail was built then removed on request.)
  - New `app/components/wheels/mobile/MobileFeaturedWheels.tsx` (client) — `/api/wheels?limit=4` horizontal rail.
  - New `app/components/wheels/mobile/MobileFindWheelsFaq.tsx` (client) — wheel-specific accordion.
- **Extra featured wheel card, desktop + mobile:** `components/wheels/FeaturedWheels.tsx` `FEATURED_COUNT` 3 → 4 (drives skeleton count + `/api/wheels?limit=`; grid is `auto-fit`, flows to 4). Mobile `MobileFeaturedWheels` also requests 4. `/api/wheels?limit=4` confirmed returning 4.
- **Refactor:** "Find a store" rail extracted to `components/layout/mobile/MobileStoreRail.tsx`, now shared by mobile `/tyres` + `/wheels` (was inline in `MobileFindTyres`).
- `tsc --noEmit` clean; `GET /tyres 200`, `GET /wheels 200`; both `data-vw` trees in `/wheels` SSR HTML.

## Update 2026-09-08 (cont.) — `/service`
- **`/service` mobile design** ported from the live "Mobile Service Page" artboard. Dual-tree split in `app/(main)/service/page.tsx`: the existing client component renamed `ServicePageDesktop`, new `ServicePage` default renders `<div data-vw="desktop"><ServicePageDesktop/></div>` + `<div data-vw="mobile"><MobileServicePage/></div>` + the `.nv-shared-chrome` hide rule. Desktop file's 955-line body + 770-line CSS untouched.
- New `app/components/service/mobile/`:
  - `MobileServicePage.tsx` (server) — shell: dark hero (`#svc-tiers`/`#svc-book` anchor CTAs, stats), green scrolling marquee strip, "Two things we do for free" (2 cards), service menu, Why-Nova 2×2, "Brands we service & sell" (logo marquee + 40+/6/98%/15+ stats), reviews, booking, locations, shared footer + tab bar (`active="shop"`).
  - `MobileServiceTiers.tsx` (client) — 5-level accordion (Log Book → Ultimate), same tier data as desktop.
  - `MobileServiceReviews.tsx` (client) — 6s featured-review rotator (resets on manual nav) + rating-bar breakdown + location filter chips + per-store review card carousel; "View/Leave on Google" links out.
  - `MobileServiceBooking.tsx` (client) — call-back form → local success state, no API (matches desktop's `setBookSent(true)`).
  - `MobileServiceLocations.tsx` (client) — 8-branch accordion (6 open + Brisbane/Adelaide "coming soon"); open → address + Call / WhatsApp / Directions.
- `globals.css` — added `@keyframes nvMobMarquee` + `.nv-mob-marquee` (respects `prefers-reduced-motion`).
- Service-section data is duplicated locally in the mobile components (desktop `service/page.tsx` keeps its arrays un-exported; it has other uncommitted work — left untouched). Future: extract to a shared `lib/service.ts`.
- `tsc --noEmit` clean; `GET /service 200` + `/ /tyres /wheels` still 200; both `data-vw` trees in `/service` HTML.

## Next steps / TODO
- [x] `Mobile Find Tyres.dc.html` → `/tyres` — done 2026-09-08 (see update above).
- [x] `/wheels` mobile (adapted from Find Tyres) + extra featured wheel card — done 2026-09-08.
- [x] `Mobile Service Page.dc.html` → `/service` — done 2026-09-08.
- [ ] Port `Mobile Service Page.dc.html` → `/service` (same dual-tree treatment). Pull live via DesignSync (project `ad6984e8-…`), not the stale `Downloads\Navbar search bar options (3)` folder.
- [ ] Decide: keep the old `MobileStickyBar` (currently inside the desktop tree, hidden ≤1023 so no conflict) or retire it.
- [ ] Commit `task2-parallel` (mobile redesign + the pre-existing visual polish are independent — can be separate commits). Not pushed to VPS (batch).
- [ ] Optional polish: real cart drawer link target, social links to real URLs, map on the store section.

## Gotchas / notes
- Import depth from `app/components/home/mobile/`: `lib/*` is `../../../../lib/…` (4 up), `context/*` is `../../../context/…` (3 up). From `app/components/layout/mobile/` context is `../../../context/…`.
- The dual-tree cost is ~2× the homepage HTML string (a few KB gzipped) + the mobile client islands hydrating even while hidden. Kept cheap by making `MobileHome` a server component with only 5 small islands. Don't add heavy interactivity to both trees.
- `next/image` is lazy by default; images inside a `display:none` tree are **not fetched** until shown — so each viewport only downloads its own design's images. Don't put `priority` on both heroes.
- Playwright was installed into the scratchpad (`...\scratchpad\node_modules` + `...\scratchpad\pw-browsers`) for screenshots — throwaway, not in the repo.
- Dev server runs on :3000 from the `nova-tyres-task2` worktree (`cd apps/customer && npm run dev`).

## Archived: mobile-audit session (2026-08-22, branch `avishek`, unrelated)
Scripted Playwright audit (9 breakpoints × 16 routes) — fixed Navbar wordmark overflow (`.nv-logo-img` width-clamp <480px), `CartContents.tsx` grid `minmax(0,1fr)`, `TyreGrid`/`WheelGrid` filter-row `flex-wrap`, `checkout/page.tsx` billing grid + `lg:`-only sticky, global `input,select,textarea{font-size:16px}` <640px, `HeroSection.tsx` bigger tap targets, `Footer.tsx` link gap. Still uncommitted on `avishek` (last pushed `24a58d6`) if that branch is picked back up.
- `nova-wordmark-light.png` is a real 1600×123 asset with zero transparent padding — any mobile fix must width-clamp, not crop.
- CSS Grid footgun (seen twice): `display:grid` with no `grid-template-columns` lets a child's min-content force the track wider than its container on narrow viewports — always pair with explicit tracks or `minmax(0,1fr)`.

---
_Last updated: 2026-09-08 by terminal Claude Code (Find Tyres mobile done)._
