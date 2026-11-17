# Torque & Tread — Rebrand Roadmap

> Checklist for converting the Nova Tyres codebase into a portfolio demo called **Torque & Tread**.
> Tick each box as completed. Grouped by priority and dependency order.

---

## Phase 1: Security — Remove Real Credentials

> **Do this first.** These are live keys and passwords sitting in committed files.

- [ ] **1.1** Rotate or revoke the Supabase DB password (`NovaTyresSecurePass2026`) — it's in 5 files
- [ ] **1.2** Rotate Stripe test keys in `apps/customer/.env.local` and `.env.local`
- [ ] **1.3** Rotate Google OAuth client secret in `apps/customer/.env.local` and `.env.local`
- [ ] **1.4** Rotate Google Maps API key in `apps/customer/.env.local`
- [ ] **1.5** Rotate Resend API key in `apps/customer/.env.local`
- [ ] **1.6** Revoke Gmail SMTP app password in `apps/admin/.env.local`
- [ ] **1.7** Rotate TOTP encryption key in `apps/admin/.env.local`
- [ ] **1.8** Rotate NEXTAUTH_SECRET across all env files
- [ ] **1.9** Invalidate the Vercel OIDC JWT in `.env.local`
- [ ] **1.10** Replace all `.env*` files with `.env.example` templates (key names only, no values)
- [ ] **1.11** Confirm `.gitignore` covers `.env`, `.env.local`, `.env.*.local` (it does, but verify after rename)
- [ ] **1.12** Remove plaintext Supabase connection strings from `apps/customer/wrangler.jsonc` and `apps/admin/wrangler.jsonc` (move to env or use placeholder)

**Files:**
`.env` · `.env.local` · `.env.development.local` · `.env.production.local` · `apps/customer/.env.local` · `apps/admin/.env.local` · `packages/database/.env` · `apps/customer/wrangler.jsonc` · `apps/admin/wrangler.jsonc`

---

## Phase 2: Remove Real Business Data

> Real addresses, phone numbers, and WhatsApp numbers of an actual business.

- [ ] **2.1** Replace all 7 store locations in `apps/customer/lib/stores.ts` with fictional stores (fake addresses, fake phones, fake WhatsApp, adjusted GPS coords)
- [ ] **2.2** Replace `NOVA_SWITCHBOARD` / `NOVA_SWITCHBOARD_HREF` in same file
- [ ] **2.3** Replace 9 store seed rows in `packages/database/prisma/seed.ts` with fictional data
- [ ] **2.4** Replace staff seed data (names, phones, emails) in `packages/database/prisma/seed.ts`
- [ ] **2.5** Replace admin user email (`admin@novatyres.com.au`) in seed
- [ ] **2.6** Replace enquiry seed data (customer names, phones, emails) in seed
- [ ] **2.7** Replace all mock data in `apps/admin/lib/nova/data.ts` — stores, staff, jobs, reviews (all reference real store names and `@novatyres.au` emails)
- [ ] **2.8** Replace hardcoded store addresses/phones/WhatsApp/Google Maps links in `apps/customer/app/components/service/mobile/MobileServiceLocations.tsx`
- [ ] **2.9** Replace store references in `apps/customer/app/(main)/service/page.tsx`
- [ ] **2.10** Replace real store photos in `apps/customer/public/images/stores/` (alphington.jpg, springvale.jpg, dandenong.jpg, bayswater.jpg, sefton.jpg) with stock/generic photos

**Files:**
`apps/customer/lib/stores.ts` · `packages/database/prisma/seed.ts` · `packages/database/scripts/seed-roles.ts` · `apps/admin/lib/nova/data.ts` · `apps/customer/app/components/service/mobile/MobileServiceLocations.tsx` · `apps/customer/app/(main)/service/page.tsx` · `apps/customer/public/images/stores/*`

---

## Phase 3: Replace Logos, Favicons & Brand Images

- [ ] **3.1** Design or source a Torque & Tread logo (primary)
- [ ] **3.2** Create wordmark variants (light + dark) to replace `nova-wordmark.png` / `nova-wordmark-light.png`
- [ ] **3.3** Create emblem/icon to replace `nova-emblem.png`
- [ ] **3.4** Create footer logo to replace `apps/customer/public/images/footer/logo.png`
- [ ] **3.5** Create favicons for both apps (`apps/customer/app/favicon.ico`, `apps/admin/app/favicon.ico`)
- [ ] **3.6** Replace hero banner images (`apps/customer/public/images/hero/hero-1.jpg` through `hero-3.jpg`) — ensure they're royalty-free or self-made
- [ ] **3.7** Replace social feed images (`apps/customer/public/images/social/social-1.jpg` through `social-8.jpg`) — these are likely from Nova's real Instagram
- [ ] **3.8** Replace `apps/customer/public/images/why/slide-1.jpg`
- [ ] **3.9** Replace background images if they're Nova's photos: `store-bg.jpg`, `newsletter-bg.jpg`, `tyres-bg.jpg`, `wheels-bg.jpg`
- [ ] **3.10** Replace service images: `workshop-hero.jpg`, `free-safety-inspection.jpg`, `free-prerwc-check.jpg`
- [ ] **3.11** Review category images in `apps/customer/public/images/categories/` — replace if proprietary
- [ ] **3.12** Review product images in `apps/customer/public/images/tyres/` and `apps/customer/public/images/wheels/` — replace if proprietary
- [ ] **3.13** Brand SVGs in `apps/customer/public/images/brands/` (Bridgestone, Michelin, etc.) — these are third-party brand logos; decide: keep as realistic demo data, or replace with generic/fictional brands

**Files:**
All files under `apps/customer/public/images/`

---

## Phase 4: Rename Brand Text — "Nova Tyres" → "Torque & Tread"

> The bulk of the work. Mostly find-and-replace but some need manual review.

### 4a. Core Identity

- [ ] **4a.1** `apps/customer/app/layout.tsx` — page title + description metadata
- [ ] **4a.2** `apps/admin/app/layout.tsx` — page title + description metadata
- [ ] **4a.3** `apps/admin/.env.local` — `NEXT_PUBLIC_APP_NAME`
- [ ] **4a.4** `apps/customer/lib/site.ts` — `SITE_URL` (replace VPS IP with localhost or placeholder)

### 4b. Email Templates & Senders

- [ ] **4b.1** `apps/customer/lib/email.ts` — `DEFAULT_FROM`, `DEFAULT_MARKETING_FROM`, `WARRANTY_NOTIFY_EMAIL` and all email template text referencing "Nova Tyres"
- [ ] **4b.2** `apps/admin/lib/email.ts` — same treatment
- [ ] **4b.3** `apps/customer/app/api/newsletter/confirm/route.ts` — confirmation email text
- [ ] **4b.4** `apps/customer/app/api/warranty/claim/route.ts` — warranty email text
- [ ] **4b.5** `apps/customer/app/api/checkout/success/route.ts` — order confirmation text
- [ ] **4b.6** `apps/customer/app/api/webhooks/stripe/route.ts` — Stripe metadata

### 4c. Customer UI Components (~30 files)

- [ ] **4c.1** `Navbar.tsx` — logo image refs + alt text + brand name
- [ ] **4c.2** `Footer.tsx` — brand name, copyright, links
- [ ] **4c.3** `MobileFooter.tsx` — same
- [ ] **4c.4** `MobileStickyBar.tsx` — brand refs
- [ ] **4c.5** `HeroSection.tsx` — headline/tagline text
- [ ] **4c.6** `WhyNovaTyres.tsx` — rename component + all copy (consider renaming file to `WhyTorqueTread.tsx`)
- [ ] **4c.7** `NewsletterSection.tsx` — brand name in copy
- [ ] **4c.8** `InStoreServices.tsx` — brand name
- [ ] **4c.9** `SocialGrid.tsx` — brand name + social links
- [ ] **4c.10** `BestDeals.tsx` — brand refs
- [ ] **4c.11** `BrandsStrip.tsx` — brand refs
- [ ] **4c.12** `MobileHeader.tsx`, `MobileHome.tsx` — brand refs
- [ ] **4c.13** `TyreHero.tsx`, `WheelHero.tsx` — brand refs + emblem image refs
- [ ] **4c.14** `TyreFAQ.tsx` — FAQ answers mentioning "Nova Tyres"
- [ ] **4c.15** `MobileFindTyresFaq.tsx`, `MobileFindWheelsFaq.tsx` — same
- [ ] **4c.16** `CartContents.tsx` — emblem ref + brand text
- [ ] **4c.17** `TyreProductDetail.tsx`, `WheelProductDetail.tsx` — brand refs
- [ ] **4c.18** `PdpParts.tsx` — share links referencing Nova social accounts
- [ ] **4c.19** `MobileServicePage.tsx`, `MobileServiceBooking.tsx`, `MobileServiceReviews.tsx` — brand refs

### 4d. Customer Route Pages (~15 files)

- [ ] **4d.1** `app/(main)/page.tsx` — homepage metadata/text
- [ ] **4d.2** `app/(main)/tyres/page.tsx` — metadata
- [ ] **4d.3** `app/(main)/wheels/page.tsx` — metadata
- [ ] **4d.4** `app/(main)/service/page.tsx` — metadata + store refs
- [ ] **4d.5** `app/(main)/warranty/page.tsx` — "Nova Tyres Pty Ltd" legal text
- [ ] **4d.6** `app/(main)/checkout/page.tsx` — emblem + brand
- [ ] **4d.7** `app/(main)/checkout/confirmation/page.tsx` — emblem + brand
- [ ] **4d.8** `app/(main)/cart/page.tsx` — brand
- [ ] **4d.9** `app/(main)/account/page.tsx` — brand
- [ ] **4d.10** `app/(auth)/login/page.tsx` — brand
- [ ] **4d.11** `app/(main)/tyres/results/page.tsx`, `wheels/results/page.tsx` — metadata
- [ ] **4d.12** `app/(main)/tyres/collection/page.tsx`, `wheels/collection/page.tsx` — metadata
- [ ] **4d.13** `app/(main)/tyres/[slug]/page.tsx`, `wheels/[slug]/page.tsx` — metadata

### 4e. Admin Panel

- [ ] **4e.1** `apps/admin/app/login/page.tsx` — login screen brand name
- [ ] **4e.2** All files in `apps/admin/components/nova/` — brand text in UI (App.tsx, ui.tsx, pages.tsx, pages-website.tsx, pages-ops.tsx, pages-comms.tsx, pages-calls.tsx, pages-more.tsx, pages-import.tsx, pages-admin.tsx, icons.tsx, image-upload.tsx)
- [ ] **4e.3** `apps/admin/lib/nova/data.ts` — mock data brand references
- [ ] **4e.4** `apps/admin/app/api/auth/totp/confirm/route.ts` — brand in TOTP issuer name

### 4f. CSS Files (comments / class names)

- [ ] **4f.1** `apps/customer/app/globals.css` — comments mentioning "Nova"
- [ ] **4f.2** `apps/customer/app/components/product/pdp.css` — comments
- [ ] **4f.3** `apps/customer/app/components/cart/cart.css` — comments
- [ ] **4f.4** `apps/customer/app/(main)/account/account.css` — comments
- [ ] **4f.5** All files in `apps/admin/app/nova-css/` — class names (`.nv-*` prefix) and comments

### 4g. API Chat Bot

- [ ] **4g.1** `apps/customer/app/api/chat/route.ts` — system prompt and brand references

---

## Phase 5: Rename Package & Workspace Identifiers

> Do this carefully — it affects imports across the entire codebase.

- [ ] **5.1** Rename root `package.json` `"name"` from `"nova-tyres"` to `"torque-tread"`
- [ ] **5.2** Rename `packages/database/package.json` from `"@nova/database"` to `"@torque/database"` (or similar)
- [ ] **5.3** Find-and-replace `from '@nova/database'` → `from '@torque/database'` across all ~40 importing files
- [ ] **5.4** Update `transpilePackages` in both `apps/customer/next.config.ts` and `apps/admin/next.config.ts`
- [ ] **5.5** Run `npm install` to rebuild workspace symlinks after rename
- [ ] **5.6** Verify both apps start cleanly

**Files:**
`package.json` · `packages/database/package.json` · `apps/customer/next.config.ts` · `apps/admin/next.config.ts` · ~40 files importing `@nova/database`

---

## Phase 6: Rename Infrastructure & Config

- [ ] **6.1** `docker-compose.yaml` — container names (`nova_tyres_web` → `torque_tread_web`, etc.), DB user/pass/name
- [ ] **6.2** `Caddyfile` — replace VPS sslip.io hostnames with `localhost` or new domain
- [ ] **6.3** `.github/workflows/deploy.yml` — either remove or update for new infra
- [ ] **6.4** `apps/customer/wrangler.jsonc` — worker name, service name, KV binding name (`NOVA_MEDIA`)
- [ ] **6.5** `apps/admin/wrangler.jsonc` — same
- [ ] **6.6** `apps/admin/middleware.ts` — if it references nova

---

## Phase 7: Rename Social Links

- [ ] **7.1** Replace Nova's real Facebook/Instagram/TikTok URLs with placeholder `#` links or fictional URLs in:
  - `Footer.tsx`
  - `MobileFooter.tsx`
  - `SocialGrid.tsx`
  - `MobileDealsRail.tsx`
  - `PdpParts.tsx`

---

## Phase 8: Rename Directories (Optional, Cosmetic)

> These don't affect functionality but clean up the developer experience.

- [ ] **8.1** Rename `apps/admin/components/nova/` → `apps/admin/components/dashboard/` (13 files)
- [ ] **8.2** Rename `apps/admin/lib/nova/` → `apps/admin/lib/dashboard/` (1 file)
- [ ] **8.3** Rename `apps/admin/app/nova-css/` → `apps/admin/app/dashboard-css/` (7 files)
- [ ] **8.4** Update all imports referencing the old directory paths

---

## Phase 9: Documentation & Cleanup

- [ ] **9.1** Update `CLAUDE.md` — project description to "Torque & Tread"
- [ ] **9.2** Update `.claude/HANDOFF.md` — remove Nova references
- [ ] **9.3** Update or delete `portfolio-case-study.md`
- [ ] **9.4** Update `.gitignore` — remove `nova-tyres` specific entries if any
- [ ] **9.5** Delete `apps/customer/README.md` boilerplate or rewrite
- [ ] **9.6** Add a top-level `README.md` for the Torque & Tread portfolio repo
- [ ] **9.7** Final grep for any remaining "nova", "Nova", "NOVA" references

---

## Phase 10: Verify & Push

- [ ] **10.1** `npm install` — verify clean install
- [ ] **10.2** `npm run dev` — verify both apps start without errors
- [ ] **10.3** Browse customer app at localhost:3000 — check all pages render with new brand
- [ ] **10.4** Browse admin app at localhost:3001 — check login + dashboard
- [ ] **10.5** Grep the entire repo for "nova" (case-insensitive) — should return zero outside node_modules
- [ ] **10.6** Check no `.env` files are staged (`git status`)
- [ ] **10.7** Commit and push to `portfolio` remote

---

## Quick Stats

| Category | Items |
|---|---|
| Credentials to rotate/remove | ~12 |
| Real business data to replace | ~3 data files + 5 photos |
| Image files to replace | ~25 |
| Source files with brand text | ~60 |
| Import statements to update | ~40 |
| Config/infra files | ~8 |
| **Total checklist items** | **~95** |

---

*Generated 2026-11-17. Track progress by checking boxes above.*
