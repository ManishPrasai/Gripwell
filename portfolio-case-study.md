# Nova Tyres — Portfolio Case Study

*Prepared from a direct source-code audit of the repository (not from README claims). File paths are given as evidence for every significant claim. No credentials, customer data, or confidential business details are included below.*

---

## 1. Project Overview

**Nova Tyres** is a full-stack e-commerce platform for a tyre and wheel retailer, built as a Turborepo monorepo with two independent Next.js applications: a customer-facing storefront (`apps/customer`) and a staff admin dashboard (`apps/admin`), sharing a single Prisma/PostgreSQL database (`packages/database`).

**Problem it solves:** tyre/wheel retail has specific operational needs that generic e-commerce platforms don't cover well — matching products to a customer's exact vehicle, coordinating fitting appointments across physical store locations, running warranty/refund claims that need staff follow-up, and giving non-technical store staff a dashboard to manage inventory, bookings, and orders without touching code.

**Target audience:**
- **Customers** shopping for tyres/wheels by size or vehicle, booking a fitting appointment, and managing orders/profile.
- **Store staff and managers** using the admin dashboard to run day-to-day operations — inventory, bookings, customer messages, refunds, and store configuration.

**Core business functionality:** product catalog (tyres, wheels, tyre+wheel packages) with vehicle-fitment matching, cart and Stripe checkout, appointment booking tied to store opening hours and staff capacity, warranty/refund claim intake, a newsletter, live chat support, and a full admin back office with role-based access control.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Monorepo tooling | Turborepo, npm workspaces |
| Frontend framework | Next.js 15 (App Router), React 19, TypeScript 5.9 |
| Styling | Tailwind CSS v4, `class-variance-authority`, `tailwind-merge` |
| UI components | Radix UI + shadcn-style components (per-app, not shared — see §5) |
| ORM / Database | Prisma 6.19, PostgreSQL (`@prisma/adapter-pg`) |
| Payments | Stripe (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`), Stripe webhooks |
| Email | Resend (customer app), Nodemailer (admin app) |
| Auth | Hand-rolled JWT (`jose`, `jsonwebtoken`) + bcrypt password hashing + refresh-token session rows — no third-party auth library |
| Admin MFA | TOTP two-factor auth (`otpauth`, `qrcode`) with hashed one-time recovery codes |
| Maps | `@vis.gl/react-google-maps` and Leaflet/`react-leaflet` (used in different parts of the app) |
| Deployment | Docker (multi-stage build), Docker Compose (Postgres, Redis, both apps, Caddy reverse proxy), Caddy for automatic TLS, hosted on a Vultr VPS |
| CI | GitHub Actions (`deploy.yml`) — type-check then SSH deploy via `docker compose` |
| Testing | None currently automated (see §5, Project Status) |

---

## 3. Implemented Features

### Customer storefront (`apps/customer`)
- **Product catalog**: tyres, wheels, and tyre+wheel packages, with brand, size, and vehicle-based search (`/api/search/by-size`, `/api/search/by-vehicle`, `/api/tyres`, `/api/wheels`, plus `similar`, `bestsellers`, `featured` variants).
- **Cart & checkout**: server-persisted cart for logged-in users, Stripe Payment Intents, and a real Stripe webhook handler that verifies signatures, is idempotent on `stripePaymentIntentId`, and creates orders inside a database transaction (`app/api/webhooks/stripe/route.ts`).
- **Vehicle-aware fitment**: `Vehicle`, `TyreSize`, `VehicleFitment` models drive size recommendations; customers can store vehicles on their account.
- **Appointment booking**: booking + availability endpoints (`/api/booking`, `/api/booking/availability`) against per-store `AppointmentSlot`s and services, including a guest (no-account) booking path.
- **Warranty & refund claims**: a real multipart-upload form (`/api/warranty/claim`) that validates uploaded files by magic bytes (not just `Content-Type`), stores them, creates an `Enquiry` record the admin dashboard reads live, and sends both a customer confirmation and a staff notification email.
- **Newsletter**: double opt-in subscribe/confirm flow (`/api/newsletter/subscribe`, `/confirm`) that never reveals whether an email is already subscribed.
- **Authentication**: email/password + Google OAuth login, JWT access/refresh tokens, per-device session tracking, login-attempt auditing.
- **Store locator**: store list/detail/nearest-store endpoints with map display.
- **Live chat**: customer-facing chat UI backed by `ChatConversation`/`ChatMessage` models and an admin-side inbox.
- **Mobile-responsive redesign**: a dual-tree responsive strategy (see §4) applied to the homepage, tyre/wheel catalog grids, and service pages.

### Admin dashboard (`apps/admin`)
- Single-page dashboard (`components/nova/App.tsx`) with sections for: order/sales overview, customer messages & calls, inventory management, product reviews (with admin replies), website/SEO content, bulk product import, store & fitting-price configuration, staff accounts, discount codes, roles & permissions, and an audit log.
- **Role-based access control**: a coarse `SUPER_ADMIN`/`STORE_MANAGER` enum backstop plus a fine-grained, per-area JSON permission map (`Role` model), enforced both in middleware and per-route.
- **Admin MFA**: TOTP setup/verify flow with encrypted secrets and hashed backup codes.
- **Refunds**: staff-initiated Stripe refunds against existing orders (`/api/admin/orders/[id]/refund`).
- **Audit trail**: `AdminActionLog` records before/after state for admin actions.

---

## 4. Technical Engineering

**Architecture.** Two independently deployable Next.js apps sharing one Prisma schema via a `packages/database` workspace package, reverse-proxied by Caddy on a single VPS (Docker Compose: `web`, `admin`, `postgres_db`, `redis_cache`, `caddy` — only Caddy is exposed to the internet; everything else is internal-network-only).

**Database design.** A single Prisma schema with 37 models across vehicle/fitment, product catalog, stores/services/appointments, customer accounts (including a parallel guest-session model for checkout without registration), orders/payments, enquiries, reviews, notifications, SEO metadata, admin/RBAC, inventory, webhook auditing, and live chat. Two applied migrations (`20260519051615_init`, `20260606162116_sync_schema_changes`).

**Authentication & security.** Entirely custom-built: bcrypt password hashing, JWT access tokens verified with `jose`, refresh tokens stored as hashes (not plaintext) alongside device/IP metadata for session auditing. The admin app's middleware is materially stronger than the customer app's — it cryptographically verifies the JWT and enforces per-route permission areas, and deliberately returns a hard 404 (rather than 401/403) on unauthorized admin requests to avoid leaking which routes exist. The customer app's middleware currently only checks that a refresh-token cookie is *present*, not that it's valid, for gating protected pages — a real asymmetry worth tightening.

**API design.** ~32 REST route handlers on the customer side and ~35 on the admin side, implemented as Next.js route handlers. The Stripe webhook and warranty-claim handlers in particular show production-grade defensiveness: signature verification, idempotency keys, transactional writes, fail-soft email delivery (logs and continues rather than throwing if the email provider is unreachable), and content-sniffed file uploads rather than trusting client-supplied MIME types.

**Responsive strategy.** Rather than a single breakpoint-driven component tree, the homepage, tyre/wheel grids, and service pages render *two* full component trees server-side, toggled purely by CSS (`[data-vw="desktop"]` / `[data-vw="mobile"]`, switching at 1024px — see `app/globals.css`). This avoids client-side UA sniffing and keeps the response cacheable; images inside the hidden tree aren't fetched by the browser until shown, so the approach doesn't double image payload despite rendering twice.

**Performance.** `next/image` throughout the catalog, skeleton loading states matched to real card dimensions to avoid layout shift, and the dual-tree approach kept cheap by limiting the duplicated trees to a few lightweight client islands per page.

**Testing.** No automated test suite exists in the repository at this time (no Jest/Vitest/Playwright config, no `*.test.ts` files, no `test` task in `turbo.json`). This is a genuine gap, not understated here.

---

## 5. Project Status

### Completed and live
- Customer storefront: catalog, cart, Stripe checkout, booking, warranty/refund claims, newsletter, auth, store locator, live chat, desktop + mobile responsive UI for home/tyres/wheels/service.
- Admin dashboard: full feature set described in §3, deployed and in active use per project records.
- Deployment: live on a Vultr VPS via Docker Compose + Caddy.

### Partially implemented / in progress
- **Mobile checkout/cart redesign**: a working mobile UI for cart and checkout exists on a separate branch but is not yet merged into the main line — deliberately parked pending reconciliation with an independent same-day checkout fix.
- **CI/CD**: a GitHub Actions deploy workflow exists but cannot run automatically yet; it's missing required repository secrets, so deploys are currently manual.

### Planned but not built
- **Vehicle registration-plate lookup**: the database schema includes a `RegoLookupCache` model clearly designed for an Australian vehicle-registration lookup (NEVDIS-style), but no API route or integration code implements it — customers can store a rego plate as plain text today, with no automated vehicle lookup behind it.
- **Buy-now-pay-later (Zip)**: an `Order.zipOrderId` field exists in the schema, but no Zip integration code was found.

### Housekeeping noted during the audit (not security content, included for completeness)
- Leftover Cloudflare Workers deployment configuration (`wrangler.jsonc`, OpenNext Cloudflare build scripts) remains in both apps from an earlier, since-abandoned hosting approach; the project now deploys exclusively to a VPS.
- `packages/ui` (the monorepo's shared UI package) is unused starter boilerplate — both apps maintain their own separate shadcn/Radix component sets instead.
- Two mapping libraries (Google Maps and Leaflet) and two email providers (Resend and Nodemailer) are each used in different parts of the app, which is worth consolidating but is not a defect.

**No automated test coverage** should be stated plainly in any client-facing material — this is an honest gap, not a hidden one.

---

## 6. Evidence (key file paths)

- Database schema: `packages/database/prisma/schema.prisma`
- Stripe webhook handling: `apps/customer/app/api/webhooks/stripe/route.ts`
- Warranty/refund claim intake: `apps/customer/app/api/warranty/claim/route.ts`
- Newsletter double opt-in: `apps/customer/app/api/newsletter/subscribe/route.ts`
- Email delivery wrapper: `apps/customer/lib/email.ts`
- Customer auth middleware: `apps/customer/middleware.ts`
- Admin auth/RBAC middleware: `apps/admin/middleware.ts`, `apps/admin/lib/rbac.ts`
- Admin dashboard shell: `apps/admin/components/nova/App.tsx`
- Mobile/desktop dual-tree CSS toggle: `apps/customer/app/globals.css` (lines ~402–419)
- Deployment: `Dockerfile`, `docker-compose.yaml`, `Caddyfile`, `.github/workflows/deploy.yml`

### Recommended screens to capture for a portfolio
1. Homepage (desktop) — hero, store locator, brand strip, deals.
2. Homepage (mobile) — to showcase the dual-tree responsive approach side-by-side with desktop.
3. Tyre or wheel catalog grid with size/vehicle filtering.
4. Checkout flow (cart → Stripe payment).
5. Admin dashboard overview (orders/messages/inventory at a glance).
6. Admin Roles & Access screen — a strong, visually demonstrable RBAC feature.

### Strongest technical accomplishments to showcase
- A production-grade Stripe webhook: signature-verified, idempotent, transactional, with its own audit log table.
- Two-tier admin RBAC (coarse role + fine-grained per-area JSON permissions) with anti-enumeration 404 behavior and TOTP MFA.
- A CSS-only, cacheable, zero-JS-sniffing responsive architecture serving genuinely different desktop/mobile component trees.
- Real, end-to-end warranty-claim and newsletter flows with server-side file validation and fail-soft email delivery — not UI mockups.

---

## 7. Professional Case Study (Portfolio-Ready)

### Project Overview
Nova Tyres is a full-stack e-commerce platform purpose-built for a tyre and wheel retailer, pairing a Next.js 15 / React 19 customer storefront with a separate, role-gated admin dashboard — both backed by a single 37-model PostgreSQL schema via Prisma. The platform handles vehicle-matched product search, Stripe-powered checkout, store-based appointment booking, and a full back-office workflow for staff, all self-hosted on a Dockerized VPS behind Caddy.

### Five Most Impressive Verified Features
1. **Idempotent, transactional Stripe webhook processing** — signature verification, duplicate-payment protection, and atomic order creation with its own audit trail.
2. **Two-tier admin RBAC with TOTP MFA** — coarse role enum backed by a granular per-area permission system, enforced in middleware with deliberate anti-enumeration behavior.
3. **Dual-tree responsive architecture** — desktop and mobile UIs rendered server-side and switched purely by CSS, avoiding client-side device detection while staying bandwidth-efficient.
4. **End-to-end support workflows** — warranty/refund claims with server-validated file uploads and newsletter double opt-in, both wired to real email delivery, not placeholder UI.
5. **Vehicle-aware product matching and appointment booking** — a domain-specific e-commerce feature (size/vehicle fitment search, per-store fitting prices and slot availability) that goes beyond a generic storefront template.

### Freelance Portfolio Description
*"Built a full-stack tyre & wheel e-commerce platform (Next.js 15, TypeScript, Prisma/PostgreSQL) with a customer storefront and a separate role-based admin dashboard. Implemented secure Stripe payment processing with idempotent webhook handling, vehicle-matched product search, appointment booking, and a two-tier RBAC system with TOTP two-factor authentication for staff. Deployed via Docker and Caddy on a self-managed VPS."*
