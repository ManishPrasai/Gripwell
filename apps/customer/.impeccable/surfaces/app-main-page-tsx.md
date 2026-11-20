---
version: 1
slug: "app-main-page-tsx"
primary_target: "app/(main)/page.tsx"
related_targets: []
---

# Home (`apps/customer/app/(main)/page.tsx`)

Mode: Persuade. Audience: Upwork evaluator on a phone (<60s) and UK drivers 25–55 in a hurry. Job: search by size or car, see the fitted price for 4 incl. VAT beside real free fitting bays at 7 London branches.

Confirmed decisions (2026-11-19):
- Slots are generated on the fly from StoreHours minus bookings; admin-blocked slots stay blocked.
- Tapping a board row opens size results with that branch preselected. Copy says "free bays today", never "book", until the checkout slot picker exists (separate later pass).
- "Tyres in stock" ordered cheapest fitted set first.
- Board is a semantic table with caption and headers; no live-region announcements. Static under prefers-reduced-motion.
- No product image may show a real brand logo; replace or use a neutral placeholder.
- Staged build: (1) tokens + board, (2) search + results, (3) other four sections, (4) merge mobile path, navbar, footer. Screenshots at 390 and 1440 and a commit after each.
- Untouchable: logo files, admin app, payment logic.

## Direction contract

THESIS: Fitting departures. The home page is a calm, light shop whose one dark object is a live departure board of real free fitting bays across seven London branches. It refuses the category hero (car photo, reg plate, benefit row, card grid).

OWN-WORLD: Cool off-white ground, graphite ink (logo #2A2E36), brand orange only on the primary action with dark text. One near-black board with amber dot-matrix numerals for times only; everything else Manrope. Hairline rules, tabular figures, no cards, no shadows beyond the board's one soft lift.

STORY: The visitor sees that fitting is available today, where and when, then picks a size and the board answers with the fitted price for 4 per branch. They believe it is a working shop because every number on the board is live data.

FIRST VIEWPORT: 390px: logo bar; two-line headline; size/car search with the orange action; the board directly below with at least three rows visible. 1440px: headline and search in the left column, board at full height on the right.

FORM: Fitting Departures, position 1 on the ordered list (IMPECCABLE'S PICK, chosen over the roll). seed:b1e082b21e7150e9. Raise from Street Atlas: soonest slot reads strongest, later rows step back in weight while staying ≥4.5:1. Signature interaction: on size pick the price column changes in place (<300ms, opacity/transform only).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
