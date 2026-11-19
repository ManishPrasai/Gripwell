# HANDOFF — shared session log

> Read this at the START of every session. UPDATE it before you finish.
> Both the VS Code extension Claude Code and the terminal Claude Code share this file.
> Keep it short and current. Delete stale notes. Convert relative dates to absolute.

---

## Current focus
2026-11-19: housekeeping done, starting the design work (customer storefront redesign).
- **Home direction decided: booking-led** (hero = "pick your size → today's fitting slots"). Recorded in `docs/design/notes.md`. Shape + prototype before restructuring or restyling home.
- **Home build, staged (brief confirmed 2026-11-19).** Stages, each stops for user review with 390 + 1440 screenshots and a commit: (1) tokens + board ✅, (2) search + results ✅, (3) other four sections, (4) merge mobile path, navbar, footer. Do not touch logo, admin, payment logic.
  - Stage 1 done: `--gw-*` tokens in `globals.css` (contrast ratios in the comment), Manrope + Doto via next/font in `layout.tsx`; `lib/fitting-slots.ts` (pure slot generation from StoreHours minus bookings by real overlap, 2 bays, 60-min job, 60-min lead, London clock; tests in `fitting-slots.test.mjs`), `lib/fitting-board.ts` (`loadBoard`), `components/home/departures/` (`FittingBoard` semantic table + `DeparturesHero`). Rendered above the OLD heroes in both trees as an interim state; stage 2 replaces the old hero/search.
  - Stage 2 done: `HomeFinder` (client; Tyre size | Car radios, native cascading selects limited to stocked sizes / seeded cars; picking a size re-prices the board to "4 fitted, from" with a 240ms fade, static under reduced motion). `lib/catalogue.ts` (stocked sizes, cars, result tyres, store record). `/tyres/results` with no brand/type/q → `components/tyres/fitted/FittedResults` (branch strip from the board, cheapest fitted set first, "Add 4 to basket" writes `gw_selected_store`; `CartContents` now preselects it). Brand/type/q browsing still uses the old `TyreGrid`. Old desktop `HeroSection` and the mobile dark hero are no longer rendered.
  - Seed: `UK_CARS` (22 cars, 152 car-years with factory fitments to stocked sizes) in `seed.ts`; reseeded local DB (also retired stray `gripwell-camden`).
  - Logo images removed: tyre-suv/mud/4x4/all-terrain, "Tyre 1.png" (showed P ZERO), all wheel photos (King/Black Rhino). Replaced with authored neutral `tyres/tyre-neutral.png` / `wheels/wheel-neutral.png` (sources in `apps/customer/.impeccable/assets/`, provenance embedded). DB image rows updated. Only `tyre-passenger.png` (no logo) remains as a photo.
  - Found, not fixed (stage 4 / later): old footer lists unstocked sizes and invented models ("Meridian CrossTrack A/T", "Terrain X Bravo AT-771"); `TyreProductDetail.tsx` hard-codes 4 invented "related" products with prices; home renders the hero twice (desktop + mobile trees → duplicate ids) until stage 4 merges them.
  - Decisions: board rows link to `/tyres/results?[size&]store=<id>`; copy says "free bays", never "book"; no aria-live; rank by distinct start time.
  - 390px screenshots must use CDP emulation (headless Chrome windows can't go below ~500px); the script used is in the session scratchpad, recreate if needed.
  - Data gotchas: an extra active DB store `gripwell-camden` exists (board ignores it, filters by `lib/stores.ts` ids); StoreFittingPrice has 0 rows (defaults apply); `apps/customer/.env.local` `EMAIL_FROM` still says "Torque & Tread".
- **`/impeccable shape home` (2026-11-19): direction chosen and confirmed.** Chosen world: "Fitting Departures" (IMPECCABLE'S PICK, seed:b1e082b21e7150e9, code-led, no image gen). The page stays light and calm; the dark departure board (real slots: branch · time · fitted price · status, soonest reads strongest) is one component; size/car search sits above it on mobile. Manrope everywhere (the logo's wordmark face) + an OFL dot-matrix font for board numbers only; amber used sparingly; dark text on orange. Sketch: `apps/customer/.impeccable/mocks/decision/model-pick.html`.
  - User answers: slots shown on home, **picked at checkout** (needs a checkout slot picker + webhook creating an Appointment linked to the Order); **seed ~20 real UK cars** (Vehicle table is empty, 0 rows); scope = **home + shared nav/footer**, merging the separate MobileHome code into one responsive page built for 390px first.
  - 5 sections: search+board, how it works, tyres in stock, branches (StoreHours + map), FAQ from real policies.
  - Open: slot top-up (seeded slots end 2027-01-15), board-row tap behaviour, stock-list ordering, whether the checkout slot picker ships with home.
  - Next after confirmation: write the direction contract to the surface brief, then build.
- Re-critique still pending (last score 20/40 in `docs/design/after/critique-2.md`).

## State
- Branch `gripwell-redesign`. All rebrand, truth, billing and demo-seed work is **committed** (`852b686`).
- **PRODUCT.md is at the repo root** (moved from `apps/customer/` on 2026-11-19). The impeccable tooling passes a root PRODUCT.md down to child apps.
- **Database: local Docker Postgres only.** Container `gripwell-postgres` (Postgres 16) at 127.0.0.1:5433, DB `gripwell`, user `gripwell` / pw `gripwell_local`. Root `.env`, `packages/database/.env` and `apps/customer/.env.local` point there.
- **The old Supabase project is retired. Do not touch it**: no migrate, resolve, seed, RLS or dashboard work. Any older note saying otherwise is void.
  - Gotcha: `apps/admin/.env.local`, root `.env.local` and `.env.production.local` still hold Supabase URLs. Repoint them to local before running anything that reads them. Admin is otherwise off-limits.
- Local DB is seeded: 7 London stores, 9 tyres, 6 wheels, no was-prices. Demo block: 15 customers, 25 orders, 10 "[Demo]" reviews, 12 appointments, 5 enquiries and 4 chats (ids `demo-*`, re-running the seed is safe).
- Checks at `852b686`: `tsc` clean, `next build` OK, `npm test -w customer` 11/11 (`apps/customer/lib/order-math.test.mjs`, Node runner).

## Done (summary, see git log for detail)
- Rebrand: Gripwell, London, GBP + VAT, UK copy, fictional brands (text wordmarks; real logo SVGs removed), mojibake fixed, Leaflet + OSM map.
- Money: `lib/fitting.ts` `quoteOrder` is the one quote (VAT-inclusive, fitting per wheel position); `lib/order-rules.ts` allows whole quantities 1–8 and refuses unknown, unpriced or retired items (cart API + create-payment-intent). Order notes go via PaymentIntent metadata → `Order.notes`.
- Truth: fake proof, payment marks, stock claims, review form and service booking form removed ("Call us to book"); `/privacy` + `/terms` added; SALE removed.

## Open (not yet done)
- PDP total leaves out fitting (PRODUCT.md open decision "Fitting included").
- Checkout: the step back is a `div role=button` (no keyboard); labels not linked to inputs; contrast (#999 greys); no `aria-invalid`.
- Wheel photos (`public/images/wheel*`) show real logos. The user will supply replacements.
- Service page has its own store list (`service/page.tsx:~189`, invents Manchester/Birmingham "opening soon"; should use `lib/stores.ts`).
- Unbacked claims still live: "80+ brands" (`BrandsWeServe.tsx:37`, `MobileFindTyres.tsx:86`) and "cheaper than the big chains" (`Whygripwell.tsx:11`).
- Code-only Nova names: `NOVA_SWITCHBOARD`, `novaIn`/`novaMarquee`, `nova-pdp`, `@nova/database`, root package `nova-tyres`, file `WhyNovaTyres.tsx`.
- Known bug: a cookieless request the cart API rejects still creates a guest Customer row.
- Pre-existing: `packages/database` `tsc` reports `lib/auth.ts(20,18) Cannot find name 'Crypto'`.
- Deploy target undecided (Vercel / Cloudflare / VPS) and needs a new hosted DB.

## Gotchas
- Dev server render worker can crash on low RAM ("Jest worker … child process exceptions"); PDP routes then return 500. Restart the dev server on :3000.
- `+44 20 7946 xxxx` / `+44 7700 9xxxxx` are Ofcom drama-reserved numbers, safe for the demo.
- Stripe test mode holds old incomplete PaymentIntents from critiques; harmless.

---
_Last updated: 2026-11-19 by terminal CLI Claude Code (PRODUCT.md moved to root, open decisions trimmed, handoff condensed; DB = local Docker only, Supabase retired)._
