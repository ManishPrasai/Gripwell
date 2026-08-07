# HANDOFF — shared session log

> Read this at the START of every session. UPDATE it before you finish.
> Both the VS Code extension Claude Code and the terminal Claude Code share this file.
> Keep it short and current. Delete stale notes. Convert relative dates to absolute.

---

## Current focus
Customer-site UI redesign on branch **`UI-Improvement`**. Work is **uncommitted** (working tree only).

## Branch / state
- Branch: `UI-Improvement` (up to date with `origin/UI-Improvement`, last commit `051fcf9 feat(admin): product image upload`)
- ~41 files modified, several new files untracked. **Nothing committed yet for this redesign.**

## What's been done (as of 2026-08-07)
- Homepage components heavily reworked: `HeroSection`, `BestDeals`, `BrowseByCategory`, `CustomerReviews`, `WhyNovaTyres`, `SocialGrid`, `BrandsStrip`, `NewsletterSection`
- Layout rewritten: `Navbar`, `Footer`
- Tyres & Wheels sections: heroes, FAQ, info bars, fitting locations, brand strips, grids
- Store locator: `StoreLocator` + `StoreMap` — migrating maps to Google Maps (new dep `@vis.gl/react-google-maps`), alongside existing Leaflet
- Account area: expanded `account/page.tsx` + new `/api/account/overview` route
- Cart: `CartContents` reworked
- New (untracked): `components/shop/tokens.ts` (design tokens), `components/home/InStoreServices.tsx`, `components/layout/MobileStickyBar.tsx`, `lib/stores.ts`, hero/wheels images, Nova wordmark PNGs (light + dark)

## Next steps / TODO
- [ ] (fill in) — verify the redesign renders (run the customer app)
- [ ] (fill in) — decide what to commit vs. keep iterating
- [ ] (fill in) — confirm Google Maps env key wired for the new StoreMap

## Gotchas / notes
- Large net deletion (~3.3k added / ~4.4k removed) = mostly refactor/simplification.
- `@vis.gl/react-google-maps` added — make sure the Google Maps API key env var is set before testing the store locator.

---
_Last updated: 2026-08-07 by terminal Claude Code (initial handoff seed)._
