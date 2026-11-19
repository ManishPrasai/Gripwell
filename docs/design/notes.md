# Design notes

## Home page direction: booking-led (decided 2026-11-19, not built yet)

The home hero becomes **"Pick your size, see today's fitting slots"**: a size search that answers with the nearest branch and its next free fitting times. It replaces the template order (sunset hero, SALE card rows, reviews mosaic, social grid).

Why: the working back end (slot booking against real store hours, Stripe checkout, admin) is what sets this portfolio apart. The current home page spends 10 sections on generic retail content and none on booking.

Status: direction only. **Do not restructure or restyle the home page** until the visual world is decided with `/impeccable shape` and a prototype.

## Pass log

- 2026-11-19 baseline critique: 19/40 (`docs/design/before/critique.md`).
- 2026-11-19 truth pass (P0 + P1):
  - one GBP price formatter and totals function, VAT-inclusive;
  - UK address form and postcode;
  - AU/Nova copy removed, invented ratings removed or labelled as sample data;
  - garbled text fixed, keyless map tiles, Apple login button removed;
  - seed retire step written.

  No visual redesign.
- 2026-11-19 re-critique after pass 1: 20/40 (`docs/design/after/critique.md`).
- 2026-11-19 misses pass:
  - £0 / unknown cart items refused;
  - `gw_*` storage keys;
  - last AU strings removed;
  - `GW-` order numbers.
- 2026-11-19 re-critique 2: 20/40, flat (`docs/design/after/critique-2.md`). A deeper walk found a negative-quantity charge bug and several pretend features.
- 2026-11-19 billing + truth pass:
  - quantity validation, with tests;
  - one shared order quote;
  - fitting charged per wheel position;
  - unrounded deal prices;
  - card-only payment marks;
  - no fake SALE, review forms, booking form or per-branch stock claims;
  - order notes saved;
  - demo `/privacy` and `/terms` pages.

  The service booking form is hidden ("Call us to book") until the booking-led home page uses `/api/booking`.
- Deferred to later passes:
  - fitting-slot step in checkout;
  - checkout label/`htmlFor` accessibility, small grey text, tap targets;
  - one type system, home redesign, minor observations.
