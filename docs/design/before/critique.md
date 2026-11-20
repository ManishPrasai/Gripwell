# Critique baseline: Gripwell customer storefront (`apps/customer`)

Method: dual-agent (A: design review · B: detector + browser overlay)
Date: 2026-11-19 · Target: `apps/customer` · Evidence: live dev server at 1440px desktop. Mobile evidence comes from `docs/design before/screenshots/Mobile/*.jpg`, because the browser window would not resize to 390px.

**Baseline score: 19 / 40, Poor.** All 10 heuristics were scored; none were marked n/a.

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Good stock line and numbered cart steps. But scroll-reveal sections stay blank until well into view, service stats show "0+ 0% <1HR" before the count-up runs, and map tiles read "API KEY REQUIRED". |
| 2 | Match System / Real World | 1 | Prices are in A$ with "GST included". Checkout asks for "Suburb", uses a "Melbourne" placeholder and a 4-digit postcode, and lists Australia. The copy says "Pre-RWC", "ACL rights", "log book service" and "4WDs". The confirmation page reads "Stripe — AUD". |
| 3 | User Control and Freedom | 3 | Quantity steppers, remove, fit count, guest checkout, reopenable checkout steps and a dismissible decline banner. |
| 4 | Consistency and Standards | 1 | Prices show as $143, A$142.50 and £896 on the same journey. There are two oranges (#FF6A1A and #FF5A1F) and three type systems: Bebas on home, DM Sans 800 in the shop, and the old green palette on confirmation. |
| 5 | Error Prevention | 1 | A UK postcode cannot be typed (`maxLength={4}`). Checkout goes ahead with a stale store from localStorage. A £0 "Nova Test product" can be bought. There is no step to pick a fitting slot. |
| 6 | Recognition Rather Than Recall | 3 | Popular-size chips, a size-guide modal, vehicle cards that show their fitting price, and a PDP running total for 4 tyres. |
| 7 | Flexibility and Efficiency | 2 | You can search by size or brand, or order by phone. Results only offer "On sale / All brands / Default", with no filter for price, season or type. |
| 8 | Aesthetic and Minimalist Design | 2 | PDP and cart are tidy. Home stacks 10 sections. `/service` is a 1,736-line page with a marquee, review rotator and count-ups. |
| 9 | Error Recovery | 2 | Stripe errors and payment declines are shown. Login and register use placeholder-only fields with generic errors. |
| 10 | Help and Documentation | 2 | Size guide, FAQ, "Not sure? Pick the closest" and phone help are all there. The warranty page quotes Australian consumer law. |
| **Total** | | **19/40** | **Poor.** The problems are mostly locale and data integrity, not visual craft. |

## Design Specificity Verdict

**LLM assessment: mostly category-interchangeable, with a few genuinely Gripwell moments.**

The home page follows the stock tyre-shop theme order (`app/(main)/page.tsx:43-53`, 10 stacked sections):
- A stock sunset-road hero with italic Bebas "QUALITY TYRES, FITTED THE SAME DAY".
- "PREMIUM PERFORMANCE EVERY JOURNEY".
- Rows of identical SALE cards, nearly all with the same tyre render.
- A "01 02 03" why-us strip.
- A reviews mosaic, a social grid and a newsletter block.

The authored parts live in the cart:
- "What do you drive?" vehicle cards that show per-type fitting prices.
- "Most cars need a set of 4" and "How many do you want fitted?".
- "Prefer a human? Call…".
- London branches listed with drama-reserved numbers.

Three visual languages fight each other:
- Home uses Bebas.
- The shop uses DM Sans 800 uppercase, frozen in by `components/shop/tokens.ts`.
- Confirmation uses the old dark-green palette (`checkout/confirmation/page.tsx:114-160`).
- `/login` falls back to a serif font and shows a placeholder orange-square logo instead of the `public/brand/` lockup.

The biggest specificity failure is not taste. **The live product is still visibly the previous Australian business**, which undercuts the "real, well-funded London retailer" premise before any design quality registers.

**Deterministic scan:** `impeccable detect` scanned about 135 files and exited with code 2. It found **4 findings**:

| Rule | Location | Notes |
|---|---|---|
| bounce-easing | `app/(main)/account/account.css:14` | `--ease-bounce: cubic-bezier(.34,1.56,.64,1)`, used on `.chat-send` and `.btn-acc` |
| bounce-easing | `app/components/cart/cart.css:36` | The same token defined again, used on the radio-dot scale-in and the full-width `.checkout-btn` |
| bounce-easing | `app/components/tyres/TyreGrid.tsx:169` | The same curve written inline on the add-to-cart icon |
| side-tab | `app/(main)/warranty/page.tsx:92` | A 4px left border on the "Required consumer-law statement" callout |

- The design review missed the duplicated bounce token. The curve is a mild back-out, not a true bounce, but it reads playful on the checkout button.
- The side-tab finding is mostly a false positive: it is a single legal callout and a left rule is a reasonable choice there. It is low priority.

**Browser overlay:** the overlay was injected on 5 pages:

| Page | Findings |
|---|---|
| `/` | 31 |
| `/tyres` | 11 |
| PDP | 7 |
| `/cart` | 18 |
| `/checkout` | 17 |

These overlay findings agree with the review:
- **Undersized functional text.** The WIDTH/PROFILE/RIM picker labels and the cart chips are 10–10.5px.
- **Real contrast failures:**
  - The "Cart 4" badge is white on #FF6A1A at 12.5px, about 2.9:1.
  - Checkout "VAT Included" is #BBB at 11px.
  - The "0/300" counter is #C5C5C5.
  - The PDP spec-list labels and the 11px #888 disclaimers also fail.
- **Eyebrow labels on almost every section.**
- **Nested cards** on the cart quantity card and the checkout delivery-charges box.

The overlay also surfaced **SA / VIC / QLD state chips in the cart**, which backs up the review's leftover-locale finding.

False positives:
- The 46px "#gripwell" text and the 24px By Size / By Brand toggle were judged against the normal-text contrast threshold. At those sizes the 3:1 large-text rule applies, so they are borderline, not failures.
- The checkout input and button contrast flags may come from placeholder or disabled colours and need a manual check.

Neither pass tested the mobile layout live.

## Overall Impression

- **What works:** the bones of a good tyre shop are here. The cart's fit-or-pickup model is genuinely thoughtful, the PDP purchase block is clean, and real working-state plumbing exists: decline banners, guest checkout and Stripe errors.
- **What doesn't:** an evaluator never reaches any of that with confidence. The first things they see are:
  - a browser tab titled "Nova Tyres";
  - a first search that returns "Nova / Test product / A$0.00";
  - a store list of Adelaide, Brisbane and Alphington over a map watermarked "API KEY REQUIRED";
  - mojibake in titles and links;
  - a checkout button promising £896 that charges about £1,055.
- **Single biggest opportunity:** make the system tell the truth with one price, one locale and one brand. That fixes roughly half the heuristic deficit before any visual redesign.

## What's Working

1. **The cart's fulfilment model** (`CartContents.tsx:243-345`):
   - fit vs pickup;
   - vehicle-type price cards;
   - partial fitting ("4 fitted · 0 taken home, no fee");
   - an honest "we'll never charge more without asking".

   This is the most product-specific design in the app.
2. **The PDP purchase block** (`TyreProductDetail.tsx`):
   - "In stock, fitted same day";
   - quantity defaults to 4, with a live total;
   - store availability;
   - secondary information folded into accordions.
3. **Working-state plumbing:**
   - decline and redirect banners;
   - Stripe load errors;
   - an empty-cart state and guest checkout;
   - a visible focus ring (`globals.css:317-324`);
   - home reviews flagged "SAMPLE DATA".

## Priority Issues

### [P0] The amount charged differs from the amount displayed, and prices use the wrong currency and tax

**Why it matters:** this breaks Principle 2 (price clarity) and is a real billing defect. An evaluator running Stripe test checkout will see a different number in Stripe than on the page.

**The mismatch (verified in source):**
- `checkout/page.tsx:331-332` computes `total = cartTotal + fittingFee`, with no VAT and no store fitting overrides.
- `api/checkout/create-payment-intent/route.ts:123-129` charges `computeTotalsCents`, which adds 20% VAT on top (`lib/fitting.ts:64-68`), in GBP.
- The checkout button says "Place order — £896.00" next to the words "VAT Included", but the charge is about £1,055.20.

**The display layer contradicts itself:**
- `money()` prints `A$` (`CartContents.tsx:39`).
- The vehicle cards print `$`, and the home page prints `$143` (`BestDeals.tsx`).
- The PDP says "GST included".
- BestDeals says "per tyre, fitted", then the cart adds £25 per tyre.

**Fix:**
- Make prices VAT-inclusive in pounds everywhere.
- Use one formatter and one totals function shared by client and server. Checkout should render `computeTotals` from the same inputs the server uses, including store overrides.
- Show "£X + £25 fitting = £Y per tyre fitted" on cards and the PDP.
- Remove the hardcoded "Fitting Fee £25.00 (included)" row from confirmation (`confirmation/page.tsx:135`).

**Suggested command:** `/impeccable harden`, then `/impeccable clarify`

### [P0] Leftovers from the old Australian / Nova Tyres business are in live data and UI

**Why it matters:** this directly breaks the brand commitment "never use Nova Tyres". An evaluator reads it as a reskinned template within seconds.

**Where:**
- The tab title on `/` and `/tyres` is "Nova Tyres | Warehouse Direct Tyres & Wheels". It comes from PageSEO in the database via `pageMetadata('home')`.
- The cart store list comes from `/api/stores`, which holds the Nova AU stores, while `lib/stores.ts` holds the London branches. That is two sources of truth.
- "Nova / Test product A$0.00" is in the catalogue.
- The cart shows SA/VIC/QLD chips.
- `service/page.tsx:417,653` says "Melbourne-wide" and "Melbourne & Sydney".
- `MobileServicePage.tsx` says "Pre-RWC".
- `warranty/page.tsx:10` refers to the ACL.
- `checkout/page.tsx:529,550,562` uses a Melbourne placeholder and a 4-digit postcode, and offers Australia.
- `lib/schema.ts:33` sets the currency to `AUD`.
- PDP copy says "Australia's trusted all-terrain tyre for 4WDs".

**Fix:**
- Reseed stores and PageSEO from `lib/stores.ts` and delete the test product.
- Switch the address to UK format: Town/City, a postcode of up to 8 characters with UK validation, an optional County, and no State field.
- Sweep the copy.

**Suggested command:** `/impeccable harden`

### [P1] Invented social proof outside the one flagged section

**Why it matters:** this breaks Principle 5 and the "no invented proof" rule. The SAMPLE DATA label covers only one section, so everything else reads as factual claims.

**Where:**
- On the first mobile screen, the hero chip "4.8 on Google · 1,240+ reviews" (`HeroSection.tsx:368`, `MobileFindTyre.tsx:125`).
- "7 stores · 5 states" (`HeroSection.tsx:381`).
- PDP "★★★★★ 4.8 (126 reviews)".
- "10+ years serving London drivers".
- On the service page, "Trusted by 250+ drivers & fleets" (`service/page.tsx:617`).
- Per-store Google ratings with "Open on Google" links (`:186-192, 740`).
- Count-up stats.
- Social grid photos that show real wheel-brand logos.

**Fix:**
- Replace the proof chips with true operational facts, for example "Fitting from £25/tyre", "7 London branches" and "Same-day slots today".
- Remove the review UIs or fence each one with a demo label.
- Swap the social grid for store photography.

**Suggested command:** `/impeccable distill`

### [P1] Broken or garbled rendering on the first screens an evaluator sees

**Why it matters:** these are instantly visible polish failures, and they sit on the surfaces seen first.

**Where:**
- **Mojibake (double-encoded UTF-8)** in about 26 files, including `lib/email.ts`, so customer emails are affected too. It shows up as:
  - "Tyre Search Results â" Gripwell" in tab titles;
  - "View all â†'" on links;
  - "Delivery charges â" £0.00" in the checkout summary;
  - "Â© 2026" in the mobile footer;
  - "Camden â" North" in the mobile footer.
- **Maps** show "API KEY REQUIRED" tiles on desktop and are blank on mobile.
- **The brand strip** is empty except for one logo.
- **Scroll-reveal sections** stay invisible too long.
- **`/login`** renders in a serif fallback, and its Apple button has no handler (`login/page.tsx:250-260`).

**Fix:**
- Re-save the files as UTF-8.
- Use a keyless tile layer or a static map with pins.
- Make reveals visible by default, and respect `prefers-reduced-motion`.
- Remove the dead Apple button and put the brand lockup on `/login`.

**Suggested command:** `/impeccable polish`

### [P2] The purchase never books a fitting time, and checkout fails accessibility basics

**Why it matters:**
- PRODUCT.md promises "pick a store and a slot", and "when?" is a tyre buyer's biggest worry.
- Checkout is the phone-critical form where WCAG 2.2 AA matters most.

**Where:**
- Slots exist only in the home `BookingSection` and on `/service`. The cart and checkout have no slot step.
- Checkout `<label>`s lack `htmlFor` and `id` pairing (`checkout/page.tsx:467-553`).
- Login uses placeholder-only inputs.
- Small text in greys #BBB, #AAA and #8D8B85 sits at 11–12.5px.
- The cart remove "✕" is a 17px glyph with no padding.
- The picker labels are 10.5px.

**Fix:**
- Add a "Choose a fitting time" step after store selection, using `/api/booking/availability`, with a no-slots state such as "Next available: Thu 09:30 at Shoreditch".
- Pair labels with their inputs and add `autocomplete` tokens.
- Raise small text to at least 4.5:1 contrast and at least 12px.
- Make the remove target 44px.

**Suggested command:** `/impeccable onboard`, then `/impeccable audit`

## Persona Red Flags

**Casey (distracted, on mobile):**
- The first-screen proof chips overflow and clip ("Price… on any w").
- The cart is one long scroll: items, method, 4 vehicle cards, fit count, a 300px blank map, the store list, then finally the summary.
- The total changes between cart and checkout.
- The thumb-zone CTA only appears after all of that.

**Riley (stress tester):**
- A UK postcode cannot be typed.
- A £0 product can be bought.
- Checkout silently uses a stale AU store.
- The displayed total and the Stripe charge disagree.
- The confirmation hardcodes £25 fitting.
- The fit count accepts 0 while "Fit them" is still selected.
- Checkout ignores store fitting overrides that the cart honours.

**Jordan (first-timer):**
- "Log book service", "4WD", "GST" and "ACL" are not UK terms.
- "Fitting included" (top bar, `Navbar.tsx:262`) and "Fitting & balancing FREE" (mobile home) contradict "+ A$25.00 per tyre" in the cart.
- On listing cards, the "View more" CTA next to a tiny cart icon blurs which action adds to the basket.

**The Upwork evaluator (project persona):**
- The tab title says "Nova Tyres".
- The first size search returns a £0 test product.
- The store picker lists Adelaide and Brisbane.
- The map is watermarked.
- Mojibake appears everywhere.

Any one of these reads as "reskinned template". Together they hide the real differentiators (webhook-verified orders, slot booking, admin) before the evaluator ever reaches them.

## Minor Observations

- **Implausible catalogue data:**
  - a 64%-off compare-at price;
  - every card marked SALE;
  - the same tyre render on most products;
  - Geolandar A/T typed as "MUD TERRAIN" and shown as a raw uppercase enum.
- **Duplicated bounce token** in `account.css` and `cart.css` plus an inline copy in `TyreGrid.tsx`. Consolidate it to one ease-out token.
- **Too many eyebrow labels:** nearly every section opens with an orange 12px kicker, so they stop signalling anything.
- **Nested cards** on the cart quantity box and the checkout delivery-charges box.
- **Confirmation page:** "Order Confirmed!" is in Bebas with an exclamation mark, while checkout uses DM Sans 900. It also says nothing about the fitting time or next steps.
- **"Featured Wheels"** shows 4 identical images.
- **Icon font:** Tabler loads from a CDN at `@latest` (`app/layout.tsx:68`), so an upstream release can break checkout icons.
- **Leftover names** in `nova_*` localStorage keys and `--nova-*` CSS vars. Users can't see them, but code reviewers can.
- **Warranty side-tab callout:** acceptable as a legal quote. Restyle it only if the system moves away from left rules.

## Questions to Consider

1. If "fitted the same day" is the promise, why is a headline price ever shown without fitting? Should the unit of sale be "£X per tyre, fitted", with pickup as the discount?
2. The real differentiator is the working back end. Why does the home page spend 10 sections on a template narrative and none on the booking moment? Could the hero be "Pick your size, then see today's fitting slots at Camden"?
3. Is the split between Bebas on home and DM Sans in the shop a decision or an accidental fork that `tokens.ts` froze in place?
4. With every invented number removed, the real trust signals are 7 branches, a written policy, a real refund flow and real stock counts. What would make those facts visually unmistakable?

---

Run notes:
- The mobile layout was not tested live, because `resize_window` had no effect on the maximised window. Mobile findings come from the existing screenshots.
- The detector overlay is left on `/` in the [Human] browser tab.
- The live server was stopped. The user's own dev server on :3000 was not touched.
