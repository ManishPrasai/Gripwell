# HANDOFF — shared session log

> Read this at the START of every session. UPDATE it before you finish.
> Both the VS Code extension Claude Code and the terminal Claude Code share this file.
> Keep it short and current. Delete stale notes. Convert relative dates to absolute.

---

## Current focus
Impeccable "truth pass" (P0+P1 from the 19/40 critique), 2026-11-19, terminal CLI. Code done + tsc clean; **DB reseed NOT run** (waiting on the user to confirm the DB is local, not hosted).

**Home direction decided: booking-led** (hero = "pick your size → today's fitting slots"). Recorded only, in `docs/design/notes.md`. Do NOT restructure/restyle home until shape + prototype.

What changed (uncommitted):
- `lib/fitting.ts` is the single source for money: `money()` (GBP, en-GB), `computeTotalsCents`/`computeTotals` — **all prices now VAT-inclusive** (VAT is extracted, not added). create-payment-intent returns `totals`; checkout shows server totals once known; success route no longer adds VAT. Min charge 30p → 400 instead of silent round-up.
- Checkout: UK address (Town/City, optional County, postcode ≤8 + UK regex), Stripe country `GB` (was hardcoded `AU`), Country select + `+61` removed.
- AU copy → UK (MOT, service book, 4x4, en-GB, Consumer Rights Act 2015 summary on warranty).
- Invented proof: hero Google 4.8/1,240 pills → "Fitting from £25" + "7 branches across London"; PDP 4.8/126 fallback removed (rating only when real reviews; JSON-LD too); service + home review blocks labelled SAMPLE DATA, Google links/logos/"verified" removed; "Trusted by 250+" removed; "fitting included" claims corrected to "from £25, balancing & valves included".
- Mojibake: all repaired (incl. lead-byte-lost variants in service page + emoji in emails). Map tiles: CARTO now watermarks "API KEY REQUIRED" → switched to OSM standard tiles with attribution on. Apple login button removed.
- `packages/database/prisma/seed.ts`: UK copy + **retire step** (isActive=false for stores not in London list, tyres/wheels not in seed catalogue or price ≤ 0).

**Brand decision (user, 2026-11-19): fictional tyre + wheel brands everywhere** (seed, filters, copy, tests), no real names/models/logos. Done in code:
- One real→fictional name map applied to the seed and the storefront.
- Logo maps emptied, so brands show as wordmarks.
- The 14 real logo SVGs were removed with `git rm`.
- Recorded in PRODUCT.md.

Still open:
- Every wheel photo (`public/images/wheel/Wheel 1.png`, `public/images/wheels/*.png`) shows a real logo (King, Black Rhino) and needs replacement assets.
- The admin app wasn't touched; it is off-limits.

**Re-critique (2026-11-19): 20/40, up from 19.** Saved in `docs/design/after/critique.md`.

Seed done on local DB:
- 7 London stores, 9 tyres, 6 wheels, 0 reviews/test data.
- New migration `20261119061244_sync_admin_mfa_fitting` fixed the schema drift.
- Supabase needs `prisma migrate resolve --applied 20261119061244_sync_admin_mfa_fitting` (user to run).

Customer dev server restarted on the local DB; it runs as a background job from the terminal CLI session.

**Demo dataset + notes (2026-11-19): DONE.** Local DB only.
- **Test guests deleted:** all 11 `guest+…@cart.gripwell.local` test customers and their rows (10 reviews, 8 appointments, 4 chats) were deleted with a one-off SQL script. The 2 extra guests from the notes check were also deleted.
- **Seed demo block rewritten** (`packages/database/prisma/seed.ts`). It is built only from its own rows:
  - 15 fictional customers (`@demo.gripwell.test`, 07700 900xxx numbers, no usable password);
  - 25 orders over the last 60 days (16 fitted, 3 confirmed, 2 pending, 2 cancelled, 2 refunded), with items, payments and status history;
  - 10 store reviews titled "[Demo] …" (`isVerifiedPurchase: false`);
  - 12 appointments, 5 enquiries and 4 chats.
- **Repeatable:** all demo rows have ids starting `demo-`. Each run releases their slot bookings, deletes them (plus legacy `*-seed-*` rows) and rebuilds them. Ran twice with identical counts.
- **Notes via Stripe:** the new `/api/checkout/notes` writes the notes into the PaymentIntent metadata just before `confirmPayment`. The success route and the webhook both save `metadata.notes`; the success route falls back to the body copy.
- Known: a cookieless request the cart API rejects still creates a guest Customer row (no cookie is returned, so the next request makes another). Not fixed.
- Pre-existing: `packages/database` `tsc` reports `lib/auth.ts(20,18) Cannot find name 'Crypto'`. The seed itself type-checks.

**Billing + truth pass (2026-11-19, after re-critique 2): DONE.** tsc clean, `next build` OK, `npm test -w customer` 11/11.

Money:
- `lib/order-rules.ts` `checkCartLines` + `isValidQuantity`: whole quantities 1–8, max 8 tyres and 8 wheels, unknown/unpriced items refused (409).
  - The cart API (POST and PUT) and create-payment-intent both use it. PUT no longer deletes on ≤0 and no longer creates rows for unknown items.
- `lib/fitting.ts` `quoteOrder` / `quoteOrderCents` is the ONE quote for the cart, checkout and the payment route; `computeTotals` was removed.
  - Fitting is per wheel position: `fittingPositions` = max(tyres, wheels).
  - `money(n, {whole})` keeps real pence (£120.50, not £121).
- Tests in `apps/customer/lib/order-math.test.mjs`, run with Node's built-in runner, no new dependencies.
- Order notes are now saved to `Order.notes` via the success route.
- The order email fitting row was fixed (it read "(n × )").

Truth:
- Removed: the Apple Pay and Klarna marks, "Lifetime road hazard cover", the "In stock at Camden…" stock text, and the PDP review form.
- The service page review modal and its 3 triggers are gone.
- Service booking forms (desktop + mobile) are replaced by "Call us to book". `MobileServiceBooking.tsx` was deleted. `/api/booking` is untouched and kept for the booking-led home page.
- New `/privacy` and `/terms` pages (demo-store banner, `components/legal/LegalPage.tsx`). The checkout "Terms of Service" link now goes to `/terms`.
- Seed: `compareAtPrice: null` on create and update. The local DB was reseeded: 0/15 products have a was-price.

Gotchas:
- (Resolved) The reviews, appointments and chats attached to test guests are gone; see "Demo dataset + notes" above.
- Stripe test mode holds incomplete PaymentIntents from the critique and from the e2e check (one for £1,522: 4 tyres + 4 wheels, fitting £120 = 4 × £30).
- Dev server restarted as a background job from the terminal CLI (product pages 200 again).
- Still deferred: PDP fitted total, keyboard back-navigation in checkout, contrast, visual redesign.

**Re-critique 2 (2026-11-19, after the misses fix): 20/40, flat (19 → 20 → 20).** Saved in `docs/design/after/critique-2.md`. Snapshot: `.impeccable/critique/2026-11-19T10-26-08Z__apps-customer.md`.
- Confirmed clean on 5 pages: no AU strings, no garbled text, no real brands, unknown items refused, server pricing = cart pricing (£582 incl. £97 VAT test).
- **New P0:** a negative cart quantity lowers the Stripe charge. `api/cart/route.ts` POST/PUT don't validate `quantity`; `create-payment-intent` sums lines unchecked. A test made a £22 PaymentIntent for a £482 basket. Incomplete test-mode PaymentIntents were left in Stripe.
- New P1s:
  - Pretend features: review submit, service booking form, order notes.
  - Apple Pay and Klarna logos on a card-only payment flow.
  - Per-branch stock claim.
  - "Lifetime road hazard cover" and "price beaten" claims.
  - The PDP total leaves out fitting; deal cards round prices.
  - Fitting is charged per item, so tyres + wheels = 8 × fitting.
- P2: `/privacy` and `/terms` return 404; `href="#"` social and forgot-password links; checkout opens with an empty cart.
- Dev server gotcha: the render worker crashed on low RAM ("Jest worker … child process exceptions"). PDP routes return 500 until the dev server on :3000 is restarted.

**Follow-up 2026-11-19: the misses below are FIXED (tsc clean) and re-critiqued (see above).**
- Cart API and payment route reject unknown, inactive or £0 items.
- Storage keys renamed `nova_*` → `gw_*`.
- AU strings, the 1300 phone number, Afterpay, +64 and km are gone.
- Order prefix is `GW-`.

Still open:
- Fake SALE: the seed sets compareAt = price × 1.2.
- "80+ brands" and "cheaper than the big chains" claims.
- Wheel photos with real logos (the user will supply new ones).
- The service-page store list is missing Greenwich and invents Manchester/Birmingham.
- Next step: user to choose the next pass (see critique-2 priorities; the negative-quantity P0 comes first).

Misses (now fixed):
- `create-payment-intent` prices unknown slugs at £0 (`?? 0`).
- Stale `nova_*` localStorage is trusted at checkout.
- AU strings: AUS-wide, AEST, +64, rego, km in the FAQs, Afterpay, `NVT-` order prefix.
- The seed sets compareAt = price × 1.2, so every product shows "SALE".
- "80+ brands" and "cheaper than the big chains" claims.

**Local DB (2026-11-19):**
- Docker container `gripwell-postgres` (Postgres 16) at 127.0.0.1:5433, DB `gripwell`, user `gripwell` / pw `gripwell_local` (local only).
- Root `.env`, `packages/database/.env` and `apps/customer/.env.local` now point there. The old Supabase URLs were deleted from those 3 files.
- `apps/admin/.env.local` and the root `.env.local` / `.env.production.local` still point at Supabase.
- Migrations deployed, then **STOPPED: drift**. `schema.prisma` has tables and columns that no migration creates (StoreFittingPrice, Role, AdminRecoveryCode, Subscriber, AdminUser MFA/role columns, Review replies, Wheel.isFeatured). Seed NOT run. Awaiting the user's choice: a new migration, or `db push` on local only.

Previously: user confirms DB → `npm run db:seed -w @nova/database` (or from packages/database) → re-run `/impeccable critique apps/customer` and compare to 19/40.

## Branch / worktree / state
- Branch: `gripwell-redesign` (cut from `Redesign` commit)
- All changes are **uncommitted** — large diff across both apps + packages/database
- No worktrees active beyond the main workspace

## What was done this session
Full cleanup pass from PRODUCT.md brief:

1. **Encoding fixed** — mojibake (Â·, Ã—, â˜…, etc.) repaired in 39 files using Python cp1252→utf-8 technique
2. **Nova/Torque & Tread text** — swept across 50+ files; replaced with "Gripwell" throughout
3. **Store names** — `apps/customer/lib/stores.ts`: 7 AU stores → 7 London Gripwell stores
4. **Currency** — A$ → £, AUD → GBP, GST → VAT across 9 files
5. **UK terms** — RWC → MOT, en-AU → en-GB, ute → van, $ prices → £ across 20 files
6. **Real tyre brands** — Michelin→Veltex, Bridgestone→Ironpath, Continental→Meridian, Pirelli→Corsaro, Goodyear→Allway, Dunlop→Strata, Hankook→Kova, Yokohama→Zetland, Maxxis→Terrain X, BF Goodrich→BRG across 18 files
7. **Google Maps** — replaced with Leaflet + OpenStreetMap (Carto light tiles, no API key) in `StoreMap.tsx`
8. **Sample data notices** — added SAMPLE DATA badge to CustomerReviews and SocialGrid
9. **Nova images deleted** — `nova-emblem.png`, `nova-logo.png`, `nova-wordmark*.png` removed from `public/images/`
10. **Seed data** — `packages/database/prisma/seed.ts` fully updated:
    - 9 AU stores → 7 London Gripwell stores
    - Admin user: `admin@gripwell.demo` / firstName 'Gripwell'
    - Managers: AU slugs/emails → London slugs/@gripwell.demo
    - REVIEWS_DATA: AU slugs → London slugs
    - ENQUIRY_DATA: AU slugs + 04xx phones → London slugs + +44 7700 9xxxxx
    - CHAT_DATA: AU slugs → London slugs + £ prices
    - SEO_PAGES: Gripwell London metadata

## Next steps
- [ ] **Commit** — user needs to run `git add -A && git commit -m "..."` (or approve in Claude Code)
- [x] **Type-check + build** — both apps pass `tsc --noEmit` and customer `next build` succeeds
- [ ] **Colour propagation** — optional: hardcoded hex values like `#076330`, `#E8572A`, `#1C3A2B` in component inline styles could be swapped for `var(--accent)` / `#2A2E36`
- [ ] **Email templates** — `logo-horizontal.png` referenced by absolute URL (needs `NEXT_PUBLIC_BASE_URL` env var)
- [ ] **Package names** — root `package.json` still named `nova-tyres`; `packages/database/package.json` still `@nova/database`
- [ ] **Supabase RLS** — enable RLS on exposed tables in Supabase dashboard
- [ ] **Git history clean** — run `git filter-repo` to purge old Supabase password from history, then force-push

## Design critique baseline (2026-11-19, terminal CLI)
- `/impeccable critique apps/customer` → **19/40 (Poor)**, saved to `docs/design/before/critique.md` (+ `.impeccable/critique/` snapshot). No code changed.
- **P0 billing bug:** checkout shows `cartTotal + fitting` (`checkout/page.tsx:331`) but server charges +20% VAT (`create-payment-intent/route.ts:123`) → displayed £896 vs charged ~£1,055.
- **P0 AU/Nova leftovers in live DB/UI:** PageSEO title "Nova Tyres", `/api/stores` returns AU Nova stores (not `lib/stores.ts`), "Nova Test product £0", 4-digit postcode `maxLength`, A$/GST strings, ~26 files with mojibake (the earlier encoding fix missed these).

## Gotchas
- `WhyNovaTyres.tsx` filename unchanged (component was renamed internally) — rename file if it matters
- `rebrand-gripwell` branch diverges from `main` by many commits — merge carefully
- `+44 20 7946 xxxx` and `+44 7700 9xxxxx` are UK Ofcom reserved "drama" numbers — safe for demo, never ring real people
- `apps/customer/public/images/brands/` still contains real brand SVGs (bridgestone.svg, michelin.svg etc.) — not referenced by code after service page brand strip was switched to text; can be deleted if desired
- `apps/customer/public/images/service/free-prerwc-check.jpg` has AU-era name — not referenced in code

---
_Last updated: 2026-11-19 by terminal CLI Claude Code (demo dataset seeded on local DB; order notes survive the webhook path)._
