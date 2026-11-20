# Critique after the truth pass: Gripwell customer storefront (`apps/customer`)

Method: dual-agent (A: design review · B: detector + browser overlay)
Date: 2026-11-19 · Target: `apps/customer` · Baseline: `docs/design/before/critique.md` (19/40)

Environment:
- Dev server on a fresh local Postgres 16 (`localhost:5433/gripwell`), seeded with the fictional Gripwell catalogue.
- Desktop pages were checked at about 1920px wide; `resize_window` had no effect.
- Mobile pages were checked by DOM measurement inside 390px same-origin iframes, not by screenshot.
- The Chrome profile still held localStorage from the old site (a `nova-cart` Yokohama line and a `nova_selected_store` Alphington store). That surfaced real bugs, listed under P0.

## Score: 20 / 40 (Poor, up 1 from 19)

| # | Heuristic | Before | After | Key issue now |
|---|---|---|---|---|
| 1 | Visibility of system status | 2 | 2 | The checkout total silently drops (£1,792 → £996) at step 3. The service-page count-ups show "0+" before they animate. |
| 2 | Match system / real world | 1 | 1 | Australian leftovers the sweep missed: "Locations AUS-wide", "AEST", `+64 (NZ)`, "rego", km in the FAQs, Afterpay, `NVT-` order numbers. |
| 3 | User control and freedom | 3 | 3 | Fit-count stepper, pickup option and editable checkout steps. The collapsed step header is an unnamed `div role=button`. |
| 4 | Consistency and standards | 1 | 1 | Whole-pound prices on home vs pence on results. "SALE" is shown on desktop without a was-price. Wheel pages say "per tyre". The A/T tyre is typed MUD_TERRAIN. |
| 5 | Error prevention | 1 | 1 | Unknown or stale cart items are priced £0. Checkout opens with no store chosen. Step 1 accepts an empty email. |
| 6 | Recognition rather than recall | 3 | 3 | Size helper and popular-size chips. The PDP doesn't carry the vehicle type into the fitting price. |
| 7 | Flexibility and efficiency | 2 | 2 | 205/55R16 returns one tyre. On mobile the cart total sits about 3.5 screens down, with no sticky summary. |
| 8 | Aesthetic and minimalist design | 2 | 2 | Home still has 10 sections. The PDP has 5 accordion panels. |
| 9 | Error recovery | 2 | 2 | The postcode error is clear but not tied to its field. The impossible-size page says "Showing all available tyres" above "No tyres found". |
| 10 | Help and documentation | 2 | 3 | Phone help everywhere and a strong UK warranty page. Nothing tells evaluators to use Stripe test card 4242. |
| **Total** | | **19** | **20** | **Poor** |

### Why only +1

The fixes that landed are real:
- One VAT-inclusive GBP money source (lib/fitting.ts).
- The cart summary is "exemplary".
- A UK postcode form with validation.
- No garbled text.
- Gripwell SEO titles and London stores.
- Fake Google proof removed.
- Real brand names and logos removed from code.

Three things held the score down:
1. **In-scope items this pass missed:** the £0 price for unknown items and the Australian strings listed above.
2. **Problems the baseline couldn't reach:** with a working local database, the reviewer could walk checkout and add to cart. Stale browser data then exposed the £0 / stale-store bugs.
3. **Issues scored for the first time:**
   - Every product gets a fake "SALE" because the seed sets `compareAtPrice` to price × 1.2.
   - The PDP total leaves out fitting.
   - Every wheel photo shows the Black Rhino logo.

## Design Specificity Verdict

**Design review: partly grounded, still a template with a reskin.**

Gripwell-specific:
- London branches.
- The UK Consumer Rights Act warranty page.
- The per-vehicle fitting picker.
- "Most cars need a set of 4".
- VAT-inclusive pricing.

Still interchangeable with any shop:
- "Our Tyre Collection / Premium Performance Every Journey" (`components/tyres/CollectionHero.tsx:21`).
- Rows of identical cards.
- The Instagram grid with "DM for price".
- The brand marquee.

Leftovers from the old brand:
- Nova green on the top bar, warranty hero and confirmation page.
- `--nova-*` tokens.

**Deterministic scan:**
- The CLI found the same **4 findings** as the baseline, exit code 2:
  - `side-tab` at `warranty/page.tsx:92` (the legal callout, a mostly-false positive).
  - `bounce-easing` ×3: `account.css:14`, `cart.css:36`, `TyreGrid.tsx:158`.

**Browser overlay:**

| Page | Findings |
|---|---|
| `/` | 46 |
| `/tyres/results` | 7 |
| PDP | 7 |
| `/cart` | 8 |
| `/checkout` | 18 |

What the overlay found:
- The same contrast family on every page:
  - White on #FF6A1A is about 2.9:1.
  - The footer pair is 4.4:1 and 2.2:1.
  - Checkout greys run 1.7–2.3:1.
- 10–10.5px picker labels.
- Kickers above headings.
- Nested cards in the cart and checkout.

False positives:
- 16 `buried-raster` hits are Leaflet tiles fading in.
- `#0a8a3a` at 4.46:1 misses the threshold by rounding.

New from the overlay:
- The load index is dropped from the cart spec ("H" instead of "112H").
- There are stray localStorage keys literally named `setItem`, `removeItem` and `clear`.

## What's Working
1. **One source of truth for money.** The cart reads "Includes £298.67 VAT" and "Fitting (8 × £25.00)"; the server charges the same pence.
2. **The cart is built around the driver:** fit vs pickup, fitting prices per vehicle up front, how many to fit vs take home, "never charge more without asking".
3. **The warranty page is honest and UK-correct,** and the review blocks are clearly fenced as sample data.

## Priority Issues

**[P0] Unknown or stale cart items are charged £0, so the summary and the charge disagree**
- **What happens:**
  - `create-payment-intent/route.ts:88` prices any slug missing from the catalogue at `?? 0`, but still counts it for fitting and the 8-tyre cap.
  - Checkout trusts `nova_selected_store` from old sessions and showed "Nova Tyres Alphington, VIC" (checkout/page.tsx:20-25, 256-272).
- **Fix:**
  - Reject or remove unknown items with a visible notice.
  - Count fitting from priced items only.
  - Rename the localStorage keys `nova_*` → `gw_*` so old data is dropped.
  - Block checkout until a store is chosen.
- **Command:** `/impeccable harden`

**[P0] Real brands in product photos, and fake reference pricing**
- **What happens:**
  - `public/images/wheel/Wheel 1.png` (used for all 6 wheels) and `public/images/wheels/king-*.png` show Black Rhino and King logos.
  - The seed sets `compareAtPrice = price × 1.2`, so every item shows "SALE". In the UK that is misleading reference pricing.
  - "80+ brands … +75 more" (`BrandsWeServe.tsx:37`, `MobileFindTyres.tsx:86-95`) and "cheaper than the big chains" (`Whygripwell.tsx:11`) are invented claims.
- **Fix:**
  - Replace the photos with logo-free assets.
  - Set compareAt to null in the seed, so SALE appears only on real markdowns.
  - Change the copy to "10 brands in stock" and drop the comparison.
- **Command:** `/impeccable distill`, plus asset work.

**[P1] Australian and Nova leftovers the sweep missed**
- "Locations AUS-wide" (`service/page.tsx:418`, `MobileServicePage.tsx:71`).
- "AEST" (`PdpParts.tsx:127`, `BookingSection.tsx:545`).
- `+64 (NZ)` (`checkout/page.tsx:507`).
- "rego" (`account/page.tsx:192`).
- km (`TyreFAQ.tsx:18`, `MobileFindTyresFaq.tsx:21`).
- Afterpay instead of Clearpay (`CartContents.tsx:26`, `Footer.tsx:43`, `PdpParts.tsx:23`).
- `NVT-` order numbers (`checkout/success/route.ts:86,235`, `webhooks/stripe/route.ts:282`, `confirmation/page.tsx:19`).
- **Command:** `/impeccable clarify`

**[P1] The PDP and listing cards don't show the all-in price**
- **What happens:**
  - The PDP "Total £796.00" excludes fitting.
  - Result cards show "£98.00" with no "per tyre".
  - The vehicle type defaults to Passenger even for 4x4 tyres.
  - Fitting fees in `PdpParts.tsx:133-136` are hard-coded strings.
- **Fix:**
  - Add fit/pickup and vehicle choice to the buy box: "£796 + £120 fitting = £916 fitted".
  - Read the fees from `lib/fitting.ts`.
- **Command:** `/impeccable clarify`

**[P1] Accessibility on the money path (deferred by scope)**
- Orange CTAs at about 2.9–3.1:1.
- Checkout labels with no `htmlFor`.
- A 14px remove button.
- 15 `outline: none` vs 7 `focus-visible` rules.
- **Command:** `/impeccable audit`, then `/impeccable harden`

## Persona Red Flags
- **Casey (mobile):**
  - Total and Checkout about 3.5 screens down.
  - The remove target is 14px wide.
  - The map loads before the store list.
- **Riley (stress tester):**
  - £0 for stale items.
  - Empty email accepted.
  - `NVT-UNKNOWN` and "undefined" postcodes on confirmation.
  - The PDP always draws ★★★★★.
  - "Write a review" pretends to submit.
- **Jordan (first-timer):**
  - "You pay nothing extra to collect" sits next to "+ £25.00 per tyre".
  - Passenger is the default vehicle for a 4x4 tyre.
  - The confirmation says "we'll call you to book", so Jordan doesn't know when fitting happens.
- **Upwork evaluator:**
  - The Black Rhino logo on every wheel.
  - "AUS-wide" and "AEST".
  - A Nova store at checkout from stale storage.
  - No hint to use test card 4242.

## Minor Observations
- Ridgeline A/T is typed MUD_TERRAIN.
- Wheels all share one photo.
- Checkout has no page `<title>`.
- "Terms of Service" links to /warranty.
- Fitting is charged per wheel at the "per tyre" rate.
- The warranty and confirmation pages use off-palette greens.
- The service-page count-ups read "0+" before they run.

## Questions to Consider
1. If price clarity is principle #1, why does any listing or PDP show a number other than the fitted price for four?
2. Would a 3-section home page plus a "working demo, use 4242" strip prove more in 60 seconds than 10 sections?
3. Fitting slots are a headline capability. Why does the journey end with "we'll call you to book"?
4. Should sample reviews exist at all, even labelled?
