# Critique after the misses pass: Gripwell customer storefront (`apps/customer`)

Method: dual-agent (A: design review · B: detector + browser overlay)
Date: 2026-11-19 · Target: `apps/customer`
Earlier runs: `docs/design/before/critique.md` (19/40) → `docs/design/after/critique.md` (20/40)

Environment:
- Dev server on local Postgres 16 (`localhost:5433/gripwell`), fictional Gripwell catalogue.
- Cart and checkout totals were checked through the API with an isolated cookie jar, so no real browser cart was touched and no payment was submitted.
- **Limit:** the dev server's render worker crashed on low memory partway through ("Jest worker encountered 2 child process exceptions"; 0.9–1.7 GB RAM free). After that, `/tyres/[slug]` and `/wheels/[slug]` returned 500.
  - B's overlay rendered the PDP before the crash. A's PDP findings come from source.
  - Restart the dev server before trusting a PDP screenshot.

## Score: 20 / 40 (Poor; unchanged from 20, up 1 from 19)

| # | Heuristic | Before | Pass 1 | Now | Key issue now |
|---|---|---|---|---|---|
| 1 | Visibility of system status | 2 | 2 | 2 | An empty cart only shows up after both checkout forms are filled. Results say "Showing all available tyres" above "No tyres found". |
| 2 | Match system / real world | 1 | 1 | **2** | The main AU sweep landed. Left: "45K km" next to "30,000 miles" (`service/page.tsx:100,111,124`), and "04xx xxx xxx" / "suburb, state" on the warranty claim form (`warranty/page.tsx:342,344`). |
| 3 | User control and freedom | 3 | 3 | **2** | The only way back a checkout step is a `div role=button` with no tabIndex or key handler (`checkout/page.tsx:64-67`). Cart remove has no undo. |
| 4 | Consistency and standards | 1 | 1 | 1 | Deal cards round £120.50 to £121 (`BestDeals.tsx:200`). Two oranges (#FF6A1A vs #FF5A1F). The service page has its own store list. "Fitted same day" vs "we'll call you to book". |
| 5 | Error prevention | 1 | 1 | 1 | **Negative cart quantities reduce the Stripe charge.** Step 1 accepts empty contact fields. Checkout silently defaults to Camden. |
| 6 | Recognition rather than recall | 3 | 3 | 3 | Popular-size chips, size guide, vehicle cards that show the fitting rate. |
| 7 | Flexibility and efficiency | 2 | 2 | 2 | Grid "Add" adds 1 tyre, the PDP defaults to 4. No discount field, though the server supports `discountCode`. |
| 8 | Aesthetic and minimalist design | 2 | 2 | 2 | Home is 10 sections and 7,316px tall. Every card says SALE. |
| 9 | Error recovery | 2 | 2 | 2 | Good postcode copy, but no `aria-invalid`, no live region, not tied to the field. |
| 10 | Help and documentation | 2 | 3 | 3 | Size guide, switchboard on cart and PDP, FAQs. |
| **Total** | | **19** | **20** | **20** | **Poor** |

### Why flat at 20

The misses pass did what it set out to do, and B confirmed it on all five pages:
- no AEST, AUS-wide, rego, Afterpay, `+64`, `NVT-` or garbled text;
- no real brand names;
- unknown or retired items are refused instead of priced at £0;
- old-site browser data is ignored.

A also verified the money path by API: 4 × Kova Apex S3 £120.50 + 4 × £25 fitting = **£582, of which £97 is VAT**. That matches the cart exactly, and the 8-tyre cap is enforced on the server.

The score held because a deeper walk found new problems of the same "truth" kind:
1. **A real money hole:** a negative quantity lowers the charge (P0 below).
2. **Pretend features:** review submit, the service booking form and order notes all look like they work but go nowhere. Payment logos are shown for methods that aren't accepted.
3. **H3 was scored more strictly** this time (keyboard can't go back a checkout step), which cancels the H2 gain.

## Design Specificity Verdict

**Partly grounded; the template look still shows.**

Gripwell-specific:
- one London branch source (`lib/stores.ts`);
- drama-reserved 020 7946 numbers;
- text-wordmark fictional brands;
- one VAT-inclusive money module;
- the cart's "what do you drive" vehicle cards.

Still generic:
- Bebas italic hero over rotating photos;
- "Our Tyre Collection / PREMIUM PERFORMANCE EVERY JOURNEY";
- 10 stacked home sections, two of which exist only to be labelled SAMPLE DATA.

Checkout uses a different visual system (#FF5A1F, #999/#AAA/#BBB greys, "Secured Checkout"), so it reads as bolted on.

**Deterministic scan (CLI):** 4 findings, the same as both earlier runs. Three are bounce-easing (advisory) at `account.css:14`, `cart.css:36` and `TyreGrid.tsx:158`; one is side-tab on the warranty callout (`warranty/page.tsx:92`), a judgement call.

**Browser overlay:**

| Page | Before | Pass 1 | Now | Main hits |
|---|---|---|---|---|
| `/` | — | 46 | 31 | 21 undersized-ui-text (10–10.5px size labels, 9.5px tags); "CART 0" white on orange 2.9:1; orange kickers 2.7–2.9:1; footer disclaimer 2.2:1 |
| `/tyres/results` | — | 7 | 7 | breadcrumb 3.2:1; h1 → h3 skipped heading; eyebrow chip |
| PDP | — | 7 | 7 | spec `dt` labels 3.4:1; "MUD TERRAIN" kicker on an A/T tyre |
| `/cart` (empty) | — | 8 | 14 | 10.5px "RECOMMENDED" and area labels; helper text 3.4:1 |
| `/checkout` (empty) | — | 18 | 18 | #999 subtitles 2.8:1; nested card; straggler word |

Notes on the overlay:
- Cart and checkout were scanned empty this time, so their counts are not directly comparable with pass 1.
- False positives:
  - Leaflet tile fade (buried-raster).
  - Page-wide em-dash counts that include the repeated header and footer.
  - "CART 0" is one global button counted on every page; it needs fixing once.

## What's Working
1. **One source of truth for money**, verified end to end through the API. The server PaymentIntent equals the cart's `computeTotals`, and the cap is enforced with a clear message.
2. **The cart is built around the driver:** three numbered steps, vehicle cards with the per-type rate, fit-N / take-home-N, "Includes £X VAT", and a phone fallback.
3. **Honest labelling where it was applied:** SAMPLE DATA on reviews and social, fictional brands only, and none of the old site's strings in user-facing copy.

## Priority Issues

**[P0] A negative cart quantity lowers the Stripe charge**
- **What happens:**
  - `api/cart/route.ts` POST accepts any `quantity` (line 27). PUT only deletes on `<= 0` (line 72), so fractional or huge values also pass.
  - `create-payment-intent/route.ts:99-102` sums lines without checking.
  - A tested 4 tyres (£482) plus a wheel at quantity −2: the PaymentIntent was **£22.00**.
- **Fix:** accept only `Number.isInteger(q) && 1 <= q <= cap` in the cart API, and re-check each line in create-payment-intent (refuse with 400).
- **Command:** `/impeccable harden`

**[P1] Pretend features and unbacked claims**
- **What happens:**
  - PDP "Write a review" only sets local state and says "submitted" (`PdpParts.tsx:154-190`).
  - The service booking form does the same (`service/page.tsx:772`), even though a real `/api/booking` exists (`BookingSection.tsx:168`).
  - Checkout order notes are never sent (`checkout/page.tsx:640-667`).
  - The PDP claims stock "at Camden, Shoreditch, Brixton, Hammersmith +3 more" from one global number (`TyreProductDetail.tsx:179-184`).
  - "Price beaten on any written quote" and "Lifetime road hazard cover" (`MobileHome.tsx:51`).
  - "Full manufacturer" warranty on fictional brands.
  - Apple Pay and Klarna logos (`CartContents.tsx:22-28`) while the PaymentIntent is card-only.
  - The PDP always draws ★★★★★ (`TyreProductDetail.tsx:142`).
  - SALE everywhere: the seed sets compareAt to exactly price × 1.2. A checked all 15 items.
- **Fix:** wire these to real endpoints or remove them, show only accepted payment marks, and set compareAt to null in the seed.
- **Commands:** `/impeccable distill`, then `/impeccable clarify`

**[P1] Price clarity before checkout**
- **What happens:**
  - The PDP "Total" leaves out fitting (`TyreProductDetail.tsx:166`, `WheelProductDetail.tsx:149`).
  - Deal cards round prices.
  - "Fitting from £25" is shown on SUV and M/T cards whose rate is £30.
  - Tyres and wheels bought together are each charged fitting: 4 + 4 as SUV = 8 × £30 = £240 (`create-payment-intent/route.ts:104-106`).
  - `FITTING_FEES` in `PdpParts.tsx:131-136` is hard-coded.
  - "You pay nothing extra to collect" sits next to "+ £25 per tyre".
- **Fix:**
  - Show "4 fitted: £582 incl. VAT" in the buy box.
  - Use `money()` without `whole`.
  - Charge fitting per corner, not per item.
  - Derive the panel prices from `lib/fitting`.
- **Command:** `/impeccable clarify`

**[P1] Checkout accessibility and validation (deferred by scope)**
- **What happens:**
  - 0 of 4 labels are linked to their inputs; 3 inputs have no accessible name.
  - No `autocomplete` on name, email or phone.
  - Step 1 continues with every field empty.
  - No `aria-invalid` or live region.
  - Greys at 1.9–2.8:1.
  - "Terms of Service" links to `/warranty`.
- **Commands:** `/impeccable harden`, then `/impeccable polish`

**[P2] Dead ends**
- **What happens:**
  - The no-match results notice contradicts itself, and its "contact us" isn't a link.
  - Checkout opens with an empty cart.
  - The confirmation page ignores pickup.
  - `/privacy` and `/terms` return **404** (`Footer.tsx:218-219`, `MobileFooter.tsx:37-38`).
  - Social links and "Forgot Password?" are `href="#"`.
- **Command:** `/impeccable harden`

## Persona Red Flags
- **Casey (mobile):**
  - The first screen has no price and no direct size entry.
  - 34 visible text nodes are under 12px.
  - Footer and drawer links are 18–20px tall, below the 24px target size.
  - Store rows dial on tap.
- **Riley (stress tester):**
  - Negative and fractional quantities.
  - A stale `gw_fitting.fitCount` carries into checkout.
  - No contact validation.
- **Jordan (first-timer):**
  - "Fitting station … delivered to this store for fitting" shows even for pickup.
  - Ridgeline A/T is typed MUD_TERRAIN.
- **Upwork evaluator:** SALE everywhere, fake review submit, fake booking, 404 legal links and the visual seam at checkout undercut the "real system" story within a minute. The backend (server pricing, caps, idempotency) is strong.

## Minor Observations
- The hero auto-rotates every 6.5s with no pause control, and has 3 `role="img"` spans all named "Gripwell workshop".
- The cart remove "✕" is about 2:1 with no padding. Method and store buttons lack `aria-pressed` or radio semantics.
- "Most cars need a set of 4" also shows under wheels.
- The results h1 doesn't echo the search, and there is no result count.
- The checkout page has no page title of its own.
- Nova remains in code only: `NOVA_SWITCHBOARD`, `novaIn`/`novaMarquee`, `nova-pdp`, `@nova/database`.

## Questions to Consider
1. Should SALE exist at all without a real former price?
2. Bought together, is fitting per corner (4) or per item (8)?
3. Should the confirmation promise same-day fitting or a call-back?
4. Should the review and booking forms be wired to real APIs (booking already exists) or removed?
