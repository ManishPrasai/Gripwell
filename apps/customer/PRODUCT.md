# Product

<!-- impeccable:product-schema 1 -->

> Written from the owner's init brief (2026-11-18) plus a repository scan. The structured interview could not run in that session, so facts marked *(inferred)* come from the code, not from the owner, and need confirming.

## Platform

web

## Users

**Primary: evaluators.** Business owners and hiring managers on Upwork who want an e-commerce site built. In under a minute they judge whether the builder can make and polish a real shop. They open it on a phone, run checkout with a Stripe test card, and look at the admin side.

**Secondary: shoppers (fictional).** UK drivers aged 25 to 55 buying tyres, mostly on mobile and often in a hurry. They care about clear prices, fitting being taken care of, and finding their tyre size easily.

The storefront has to work for the shopper so that it convinces the evaluator. Any part that only looks good to the evaluator but would not work for a real driver fails both.

## Product Purpose

Gripwell is a fictional London tyre and wheel retailer. It is the shopfront for a portfolio demo of a real, working full-stack e-commerce app. Success means an evaluator leaves believing two things: it feels like a real, well-funded retail brand, and the builder clearly took care over the buying journey, the edge-case states and the admin tools.

## Positioning

What a template shop cannot honestly claim: this is a real system, not a mock-up. Payments really go through Stripe (test mode), orders are written by a verified, idempotent webhook, fittings are booked against real store hours and capacity, warranty claims upload files and email staff, and an admin back office has roles, MFA, refunds and an audit log. The storefront should make that depth visible instead of hiding it behind a marketing veneer.

## Operating Context

- Evaluators usually arrive from an Upwork profile or proposal link, on a phone first. Desktop is a second look.
- They will try the buying flow end to end with a Stripe test card, then open the admin dashboard (`apps/admin`, a separate app that shares the same database).
- Shoppers search by tyre size or by vehicle, choose between fitting at a store or pickup, pick a store and a slot, and pay.
- Seven fictional London branches: Camden, Shoreditch, Brixton, Hammersmith, Islington, Greenwich, City (`lib/stores.ts`). Phone numbers are Ofcom drama-reserved (+44 20 7946 xxxx).

## Capabilities and Constraints

Confirmed in code *(inferred from the repo)*:
- Catalogue of tyres, wheels and tyre+wheel packages, searchable by size and by vehicle, with vehicle fitment data.
- Cart (server-persisted when logged in) and Stripe Payment Intents checkout. Tyres default to a quantity of 4 and are capped at 8 per order, enforced in both cart and checkout API (`lib/order-rules.ts`).
- Fitting booking against per-store slots, including guest booking. Fitting is priced per tyre by vehicle type (passenger, SUV/4x4, commercial, truck) (`lib/fitting.ts`).
- Warranty and refund claim form with checked file uploads; newsletter with double opt-in; email/password and Google login; account area; store locator with map; live chat.
- Stack: Next.js 15 App Router, React 19, Tailwind v4, Radix/shadcn, Prisma/PostgreSQL, Stripe, Resend, Turborepo.

Open decisions, to settle before the redesign ships:
- **Currency and tax.** `lib/fitting.ts` still uses A$ and adds 10% GST on top of product prices. A London store needs pounds, and UK shoppers expect prices shown including 20% VAT.
- **"Fitting included".** The brief says shoppers value fitting being included. The code charges fitting separately, per tyre, on top. Decide whether prices include fitting or show it as a clear separate line.
- ~~**Tyre brands.**~~ **Decided 2026-11-19:** fictional brands only (see Brand Commitments).
- **Leftover old names.** Store display names in `lib/stores.ts` still say "Torque & Tread"; the package is still `@nova/database`.
- **Deploy target.** The repo has signs of Vercel (project CLAUDE.md), Cloudflare (`opennextjs-cloudflare` scripts) and a Vultr VPS (`lib/site.ts`). Not yet settled.

## Brand Commitments

- Name: **Gripwell**. A fictional brand made for this portfolio demo.
- **Logo is fixed.** Use the files in `public/brand/` as they are, in all their versions (horizontal, stacked, mono, white, reversed, icon, favicon, app icon, OG image). The wordmark is Manrope Bold, lowercase, turned into outlines.
- Apart from the logo, everything is open to rethink, including the palette and UI fonts suggested in `public/brand/brand-guide.html`. Those suggestions are not binding.
- Brand feel: confident, clear, trustworthy, modern. Not flashy.
- Never use: "Nova Tyres", "Torque & Tread", or any other name, asset, photo or detail from a previous or real company.
- Banned outright: a generic AI-template look, purple gradients, rows of identical cards, stock filler, fake reviews, real tyre or wheel brand logos.
- **Fictional tyre and wheel brands only (decided 2026-11-19).** Seed data, filters, copy and tests use invented brands and model names, never real manufacturer names, model names or logos. Brands render as text wordmarks.
  - Tyre brands: Meridian, Corsaro, Kova, Zetland, Terrain X, Brackley, Veltex, Ironpath.
  - Wheel brands: Halden, Ostra, Marlow, Vanta.
  - Product photos must not show a real logo. As of 2026-11-19, all wheel photos in `public/images/wheel*` do (King, Black Rhino) and need replacing.

## Evidence on Hand

- Brand kit: `public/brand/` (logos, icons, OG image, one-page brand guide).
- Store photos: five downloaded images in `public/images/stores/`; Islington and Greenwich have none.
- Working system to point at: Stripe test checkout, admin dashboard, booking, warranty claims. Technical write-up in `portfolio-case-study.md` at the repo root (still uses the old name).
- **Not on hand, so never invent:** customer reviews, ratings, testimonials, customer or sales numbers, press mentions, awards, or "trusted by" claims. Gripwell has no real customers. Any existing review components (such as `CustomerReviews.tsx`) show made-up content and must be removed or clearly marked as demo data.
- Older images (hero, social, category, product) came from the previous brand. Check where each came from before reusing it *(inferred from REBRAND-ROADMAP.md Phase 3)*.

## Product Principles

1. **Real beats pretend.** Show working states (validation, empty cart, payment declined, no slots, out of stock) instead of hiding them. Careful edge cases are the proof the evaluator is looking for.
2. **Price clarity first.** A hurried driver should see the full amount they will pay, including what fitting costs, before checkout and without any arithmetic.
3. **Phone first, in under a minute.** The first screen on a phone has to show both brand quality and a clear way into the buying journey.
4. **A retailer, not a template.** Every surface should feel like a specific, well-funded London tyre shop, never like a generic e-commerce theme.
5. **No invented proof.** Trust comes from clarity, real policies and working features, never from made-up social proof.

## Accessibility & Inclusion

No product-specific standard was set. *(Inferred default:)* aim for WCAG 2.2 AA, because UK retail customers expect it and evaluators may check it, with special care on the checkout and booking forms used on phones.
