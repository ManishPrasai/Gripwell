# HANDOFF — shared session log

> Read this at the START of every session. UPDATE it before you finish.
> Both the VS Code extension Claude Code and the terminal Claude Code share this file.
> Keep it short and current. Delete stale notes. Convert relative dates to absolute.

---

## Current focus
**2026-11-20 (evening): Comp F built** at `docs/design/comps/f/index.html` from the brief `gripwell-comp-f-prompt.md` (repo root). It is an execution pass on D: same structure, D's flagged issues fixed. **Uncommitted**; awaiting the user's review. A–E untouched.
- Rebuild only F: `python docs/design/comps/build_comps.py docs/design/comps f`. Code is the "COMP F" block at the end of `build_comps.py` (`F_CSS`, `f_body`). `write()` gained `doc_title`; `comp_href()` now only links `index*.html` (E has a `credits.html`). Stage nav lists A–F.
- Service photos (2026-11-20 round 2, user said the first set was dark and inconsistent). All six are now bright, modern daylight shots in `comps/assets/img`, credited in `CREDITS.md`:
  - `photo-tyre-change-on-jack-*` (Commons, cropped with sharp)
  - `photo-lifted-car-suspension-*` (Commons, cropped)
  - `photo-wheel-balancer-console-*` (Commons, cropped)
  - `photo-mechanic-engine-maintenance-*` (Commons, cropped)
  - `photo-mechanic-laptop-diagnostic-*` (copied from E)
  - The tread close-up `f165704163`
  - Also new: `tyre-three-quarter-600.png`.
  - Rejected photos and the reasons are in `CREDITS.md` (logos, VW badges, a number plate, soft focus).
- `--paper` is now `#F5F0E8`.
  - The brief's `#FAF8F4` was applied but is invisible: 1.06:1 against white.
  - The user found `#F3EDE3` muddy.
  - "Full today" badge text is `#5F5F5F` to keep AA.
- Round 3 (user list, 2026-11-20):
  - "How it works" icons are now a wheel, a calendar-clock and a car key fob, authored inline SVG.
  - Branches on desktop: list on the left (7fr), sticky map on the right (5fr).
  - Branches on mobile: the map stays first (`order:-1`); each card has a full-height photo column, `clamp(112px,34%,150px)`, instead of the 80px thumbnail.
- **Production flags (from the user):**
  - Carry the round-3 icons and branch layouts into production.
  - Use the headline "Tyres fitted across London" in production. The current "fitted today at 7 London branches" is long and untrue when a branch is full (City is, on this page).
- `/impeccable critique` scored **25/40**, run dual-agent; the snapshot is in `.impeccable/critique/`. Everything flagged was fixed afterwards. The detector now reports only 4 cramped-padding false positives.
- **Round 4 (2026-11-20 late), all fixes from the 26/40 critique (`.impeccable/critique/…17-38-36Z…`); user OK'd departing from the brief. Uncommitted. User will re-run `/impeccable critique` themselves.**
  - The "Available today" rail and the Branches section are merged into one `#where` "Free fitting bays today" section (`f_where()`): a graphite lead tile for the soonest bookable branch (big time, "Show tyres at Camden"), then a soonest-first list of the other 6 (time, name, badge, street + postcode, fitting price), with a sticky labelled map on the right on desktop and below the list on mobile. No branch photos and no repeated "Open" pills; one hours line. If every branch is full, the lead tile switches to "Every branch is full today" and the earliest bay tomorrow (code path only, today's data doesn't show it).
  - Badges are now "2 bays free", "1 bay free", "Last slot today" and "Full today". `--green-text` is now `#166534` so badges pass AA on `--paper`.
  - `MAP_JS` (shared) gained two opt-in attributes: `data-pins` (custom labels plus an optional tooltip side) and `data-still` (no drag or zoom under 768px, so the map never catches a scroll). A–D don't use them.
  - Hero: H1 "Tyres fitted across London."; columns 1fr/1fr with a square photo, which closes the gutter; the trust strip is replaced by a live "Next free bay: Camden, today 09:30" link.
  - Deals ("Popular sizes, priced fitted", `#deals`): the set-of-4 fitted total leads, with "£X a tyre + £25 fitting" underneath and a section line saying it's at Camden. The invented "was" prices and Save badges are gone (`DEAL_WAS` is now used only by D). The brand shows once.
  - Each "Checkable, not claimed" item now links to its proof (`#deals`, `#where`, the warranty page).
  - Services ("In the workshop"): 4 photographed services (Fitting and balancing, Alignment, Pre-MOT, Manufacturer service) plus a line covering puncture repair and the free safety inspection, with the phone number. The jack and track-tyre photos are dropped; see `CREDITS.md`.
  - A demo strip sits above the nav (test card, nothing charged). The mobile sticky bar slides up only after the hero button scrolls away (IntersectionObserver) and uses the same label. The how-it-works icon is now a steering wheel and step 2 reads "Choose a time". Footer: "Shop and help" links (Tyres, Wheels, Branches, Warranty claims, FAQ, About), a hidden footer h2, and Terms at 44×44. `h3`s are balanced.
  - Checks: no overflow at 1440 or 390; page height 4768 / 5900. Every new colour pair passes AA (lowest 4.7:1). The detector reports only the 4 known cramped-padding false positives.
  - Not fixed: the hero photo is still the hazy backlit shot; Commons had no bright, logo-free replacement. Pin highlighting on row hover was skipped.
  - Re-critique of round 4: 27/40 (`.impeccable/critique/…18-01-11Z…`). Trend 25 → 24 → 26 → 27.
- **Round 5 (2026-11-20, latest), all 27/40 findings fixed; uncommitted; user will re-run `/impeccable critique`:**
  - Deals: cards are now typographic, led by the size ("205/55" with "R16 · V rated" underneath), so no product photo. Then the brand, model, the fitted set-of-4 total and "£X a tyre / + £25 fitting a tyre" on two lines. A 1px border, with the shadow only on hover. Heading: "Popular tyres, priced fitted". `F_DEAL_IMG` was removed. A tread-stripe strip was tried and dropped because the detector flagged `repeating-stripes-gradient`.
  - Type: `.h2` is now `clamp(1.625rem, 1rem + 2.5vw, 2.25rem)` (26px floor), and `.sec` has more top padding.
  - States: the finder has `novalidate` and an inline error ("Choose your tyre width to see prices.", `aria-invalid`), plus a "Choose a width first" helper under Profile/Rim. The footer newsletter has an inline invalid-email message and a double-opt-in success message. The "Last bay" badge now reads "Last slot", which fits at 390. The section line explains the order: "Soonest first, then cheapest fitting". This tie-break is a comp decision, so production `loadBoard` has to match it.
  - Close: the floating newsletter card is replaced by an `.end` "Try it end to end" section. It has a test-card line, "Start with your tyre size" plus "Open the admin demo", and 4 numbered steps (basket total, Stripe test payment, idempotent webhook, admin). Every claim in it matches PRODUCT.md; no email claim. The newsletter moved into the footer's first column with a ghost Subscribe button.
  - The sticky bar is hidden while `.end` or the footer is on screen.
  - Map: in `MAP_JS`, the 5th pin field `p[4]` keeps a pin labelled (orange `.lbl.lead`), and still maps make markers non-interactive and non-focusable (`keyboard:false`). On phones the map is 180px, shows only "Camden 09:30" labelled, and has 0 focusable pins.
  - Copy: "every tyre on this page"; services now read "Quoted by phone", "Free" and "From £25 per tyre", with the phone number once; `.also` is capped at 62ch with a non-breaking "15‑minute"; the footer reads "Head office: …" plus "All 7 branches".
  - Checks: tested at 390 in headless Chrome. The sticky bar is off at the top, on mid-page and off at the close; both errors and the email success message render. No overflow at either width. All new colour pairs pass AA (lowest 4.56). The detector shows only cramped-padding false positives (5 now: the new section adds one). Heights: 4766 / 6419px; mobile is longer than in round 4 because of the close section.
- **Contrast fixes depart from the brief's pinned colours** (brief values failed AA):
  - Orange buttons and the Save badge use ink text instead of white.
  - `--orange-text` `#C2410C` for prices; `--green-text` `#15803D` for badges.
  - `--muted-fg` changed to `#6B6B6B`.
  - Social icons at .5 alpha (brief said .3).
  - Newsletter border changed to `#6B6B6B`.
  - "Last bay" pulses its tint, not its opacity.
- **Other deviations from the brief:**
  - Mobile rail cards are about 161px wide, not 200px, so 2 cards plus a peek fit at 390.
  - The full card drops to level 0 instead of `opacity:.6`.
  - Deals use one photo with 4 views plus a brand label.
  - Deals add "Set of 4 fitted from £X", which is computed at Camden's £25.
  - Desktop rail has prev/next buttons.
  - The map is sticky at a fixed height.
  - The logo stays the Gripwell SVG. The brief's "Lane G" name doesn't match any asset.
- Open, not fixed (brief-pinned or production):
  - "Call to book" appears 3 times.
  - The Car tab is inert.
  - No number-plate lookup.
- 390px screenshots: `shot.cjs` (CDP) lives in the session scratchpad; extract the srcdoc into a temporary `f/_frame.html` to shoot it, then delete it.

**2026-11-20 (later): user picked Comp D, a new fifth comp, as the FINAL homepage direction.** Built at `docs/design/comps/d/index.html` (uncommitted, like all of `docs/design/comps/`). Not yet built into production; next step is to confirm the open items below, then port D to `apps/customer` home.
- D = light page, **no departure board** (availability = white branch cards, soonest first), Manrope 400–700 only (no Doto), technician photo hero, services 3x2, dark "Checkable, not claimed", deals, branches map + cards, newsletter, 3-col footer. One 768px breakpoint + clamp(); branch cards use a container query.
- Rebuild only D: `python docs/design/comps/build_comps.py docs/design/comps d` (no comp args = rebuild all, which would recreate `a/index.html` etc. next to the user's hand-renamed `index a.html` files).
- Verified with headless Chrome at 375/390/768/900/1024/1440: no horizontal overflow, mobile targets ≥44px, no text <14px, Manrope only. Gotcha found: `.sr` (absolute) spans inside a scroll rail widened the mobile page to 740px; `.rail{position:relative}` fixed it. Same trap applies in production.
- Open, flagged to the user: top-bar "Free collection & delivery on 4+ tyres" is unbacked (kept as briefed); deal "was" prices are invented (DB has none; `DEAL_WAS` in the script); Balancing + Manufacturer service photos are grey placeholders (curated Commons candidates exist in `assets/img/credits.json`, not downloaded).
- Earlier: A, B, C done and left untouched.
- **Comp E (2026-11-20, comparison only, not a replacement for D):** built with the `design-taste-frontend` skill at `docs/design/comps/e/index.html`, a plain static page (no 1440/390 iframe stage). Classified as a "place" page.
  - Look: Gripwell's own colours via `start.mjs brand`, Instrument Sans, square corners.
  - Page: photo hero, "Seven London branches" (street + district, fitting £25–35, hours), tyre/fitting price rows with a 4-photo strip, story + `picture-develops` moment, booking form (`mailto:` on `.example`), close with the name set large.
  - Rebuild: edit `e/.taste-skill/page.tpl.html` or `build_e.py`, then run `python .taste-skill/build_e.py` from `e/`. Don't hand-edit `index.html`.
  - Checks:
    - Gate **PASS**, with 1 waiver: the kit's own button colour transition.
    - consistency: 0 FAIL.
    - perf: 0 FAIL.
    - copy-lint: clean.
  - Gotcha: `e/assets` is the skill kit copy (~40 MB); `e/.gitignore` skips `shots/` and Chrome profiles.
  - 11 Commons stand-in frames, 8 of them on the page proper; credits in `e/credits.html`.
- Knowledge graph rebuilt 2026-11-20 on the whole repo (`graphify-out/`, 2104 nodes, 241 communities; semantic pass via Gemini). Missing: PDF text (`pypdf` not installed) and 5 `stage2-390-*.png` screenshots. Incremental refresh: `/graphify . --update`.
- Job 1 (homepage fixes) committed `e58a79b`: board rendering, per-branch seed rates £25–35 + varied bookings (`demo-board-*`), 4 featured wheels, "per tyre fitted" wording, Manrope everywhere (Bebas/DM removed, Doto = board digits only), graphite tab bar/footer/strip, mono socials, SocialGrid + dead home components deleted, map shows all 7 orange pins, disabled selects styled, `bayStatus()` in `lib/fitting-slots.ts` (+test, 20/20).
  - "Live times are unavailable" root cause was the **stopped Docker container**. `docker start gripwell-postgres` if the board falls back.
  - The board mix (2 free / 1 free / Last bay / Full) is seeded relative to the day the seed ran; **re-run the seed** to roll "today" forward.
  - Dev-only "N" badge confirmed absent from a prod build.
- Job 2: static comps in `docs/design/comps/{a,b,c}/index.html` (each shows 1440 + 390 side by side via srcdoc iframes). Generated by `docs/design/comps/build_comps.py` (edit it and re-run; don't hand-edit the HTML). Credits in `CREDITS.md`; photos are Commons stand-ins. Board data = real `loadBoard` output at Fri 20 Nov 08:10.
  - Gotcha: CARTO tiles now need an API key (watermark tile). Comps use Esri World Light Gray Canvas (keyless); production still uses OSM standard tiles.
  - Comp services list only the six real services from `InStoreServices.tsx`, priced only where the site prices them.

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
_Last updated: 2026-11-20 (late) by terminal CLI Claude Code (Comp F round 5: all 27/40 critique fixes, typographic deals, "Try it end to end" close, inline states; uncommitted, user to re-critique)._
