# Comp E: Gripwell homepage redesign

## Context
You are rebuilding the Gripwell homepage comp at `docs/design/comps/e/index.html` via `docs/design/comps/build_comps.py`. This is a static HTML comp (desktop 1440px + mobile 390px in iframes) for a fictional London tyre e-commerce site. The comp is for portfolio screenshots, not production code.

Previous comps (a/ b/ c/ d/) must NOT be touched. Only create e/.

Before building, run `/taste` to get art direction guidance for photography and visual mood. Apply its recommendations to photo selection and treatment throughout the comp.

## What changed from Comp D
Comp D validated the structure. This comp fixes execution quality issues flagged by the client and by a frontend design audit. The changes:

### Revised section order
1. Hero (with help icon + trust micros)
2. How it works (NEW thin strip, not a full section)
3. Available today (badges more prominent, THIS is the bold design moment)
4. Deals (MOVED UP from position 7, different images per card)
5. Why Gripwell (numbers removed, kicker removed)
6. Services (MOVED DOWN from position 3, placeholders fixed)
7. Branches (visual separation from previous section improved)
8. Newsletter (more specific value prop)
9. Footer (social icons toned down)

REMOVED: "In stock now" text line (it served neither audience and added noise).

### Anti-generic rules (from frontend design audit)
These are MUST-FOLLOW rules. The comp must NOT look AI-generated:

1. **Kill ALL-CAPS kickers.** Do NOT put tracked-out uppercase labels ("SERVICES", "DEALS", "BRANCHES") above section headings. If a section needs a kicker, use sentence case at the same optical size as surrounding body text, in --muted-fg. Only use a kicker where the heading alone would be ambiguous. Most sections don't need one.
2. **No numbered markers (01/02/03) unless content is truly sequential.** The "Why Gripwell" trust claims are parallel, not ordered. Remove the numbers. Use bold lead-in text or a different structural device.
3. **No "→" arrows appended to buttons or link text.**
4. **No identical card treatment everywhere.** Cards must vary by purpose (see card hierarchy below).
5. **Warm cream (#FAF8F4) is NOT the default page background.** Use --surface (#FFFFFF) as the primary background. Use --paper (#FAF8F4) only on specific alternate sections to create rhythm. The page should read as white-dominant, not cream-dominant.
6. **No meta strings joined with middle dots** like "A · B · C" except where genuinely listing equivalent items.
7. **Sentence case everywhere** (headings, labels, buttons). The only uppercase on the page should be the logo.

### Typography system
Font: Manrope only. No other typefaces.

| Role | Weight | Size | Tracking | Line-height | Notes |
|------|--------|------|----------|-------------|-------|
| Hero headline | 700 | clamp(1.75rem, 4vw, 3rem) | -0.03em | 1.1 | Tight, locked letters |
| Section heading (h2) | 700 | clamp(1.25rem, 2.5vw, 2rem) | -0.02em | 1.2 | |
| Card heading (h3) | 600 | 1.125rem | -0.01em | 1.3 | |
| Body text | 400 | 1rem (16px) | normal | 1.6 | Max 70ch line length |
| Small/meta text | 400 | 0.875rem | normal | 1.5 | --muted-fg colour |
| Prices | 600 | varies | normal | 1 | font-variant-numeric: tabular-nums |
| CTA button | 600 | 1rem | normal | 1 | Sentence case, no arrows |

### Card hierarchy (3 levels)
- **Level 0 (informational):** No shadow, no border. Content sits flush on the section background. Used for: how-it-works steps, trust claims in Why Gripwell.
- **Level 1 (scannable):** Very subtle shadow (0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03)). No visible border. border-radius: 12px. Used for: available today cards, deal cards, branch cards.
- **Level 2 (prominent):** Slightly deeper shadow (0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)). Used for: hero search form container, newsletter signup card. These are the elements that "float" above the page.

### Section backgrounds (creating rhythm)
- Hero: --surface (#FFFFFF)
- How it works: --surface (#FFFFFF) with a subtle bottom border (1px --line)
- Available today: --paper (#FAF8F4) ← the bold section gets the warm background
- Deals: --surface (#FFFFFF)
- Why Gripwell: --graphite-2 (#1E2128) ← dark section stays
- Services: --surface (#FFFFFF)
- Branches: --paper (#FAF8F4)
- Newsletter: --surface (#FFFFFF)
- Footer: --graphite (#2A2E36)

### Photo treatment
Apply a consistent CSS filter to ALL photos:
```css
img:not(.logo):not(.icon) {
  filter: contrast(1.04) saturate(0.9);
}
```
This slightly desaturates and unifies colour temperature across Wikimedia photos so they feel cohesive.

## Section-by-section spec

### 1. HERO
Desktop: 55/45 grid. Left side: search. Right side: technician photo (aspect-ratio: 4/5, border-radius: 16px, overflow hidden).

Left side content, top to bottom:
- Headline: "Tyres fitted today at 7 London branches." (Manrope 700, hero size)
- Lede: "Pick your size to see the fitted price for a set of four at each branch. Fitting from £25 per tyre fitted. All prices include VAT." (body text, --muted-fg)
- Tab switcher: "Tyre size" (default active, filled graphite bg) and "Car" (outline style). Tabs are pill-shaped, not square.
- Under Tyre size tab:
  - Labels "Width", "Profile", "Rim" in --muted-fg, sentence case, 0.875rem
  - Width: full-width select
  - Profile and Rim: side by side 50/50
  - Below each dropdown group: a "?" icon (small circle, --muted-fg border, "?" in center) linked to text "How to find your size" in --muted-fg. Opens a tooltip or popover showing a diagram of a tyre sidewall with numbers labelled. For the comp, the "?" icon + text is sufficient; the popover is a production feature.
- Hint text: "Your size is on the tyre's sidewall, for example 205/55 R16" (0.875rem, --muted-fg)
- CTA button: "Show tyres and prices" (full width, --orange bg, white text, border-radius: 10px, min-height: 48px, font-weight: 600)
- Trust micro-strip below CTA: Three items in a row, each with a small inline SVG icon (not emoji, not font icon) + text. Items: "7 branches" (pin icon), "Same-day fitting" (clock icon), "VAT included" (check/tick icon). Text in 0.8125rem, --muted-fg. Icons in --muted-fg, 16px. Items separated by generous spacing, NOT middle dots.

Mobile (390px):
- Full width, no photo (remove the technician photo on mobile entirely). The photo pushes useful content below the fold and adds no information the user hasn't already received from the headline.
- Stack everything vertically
- Width dropdown: full width
- Profile + Rim: side by side 50/50
- Trust micro-strip: wraps to 2 lines if needed, left-aligned
- CTA: full width

### 2. HOW IT WORKS (new, thin strip)
This is NOT a full section. It's a 60-80px horizontal bar between the hero and the main content.

Desktop: Three items in a horizontal row, centered, with subtle connecting lines or arrows between them.
- "Pick your size" ... "Choose a branch and time" ... "We fit, you drive"
- Each item: small inline SVG icon (tyre icon, calendar icon, car icon) above or beside the text
- Text: 0.875rem, Manrope 500, --ink colour
- Connecting device: a subtle line, light grey, between items (not an arrow character "→")
- Background: --surface, with a 1px --line border on bottom

Mobile: Same three items but compressed into a single row that fits 390px. Icons only slightly smaller. Text wraps if needed. Still horizontal, not vertical. This should feel like a progress indicator, not a content section.

### 3. AVAILABLE TODAY (the bold moment)
This is the section that should feel distinctive. It's the signature of the page.

Background: --paper (#FAF8F4). This is the one section where warm background makes the content feel alive and present.

Desktop layout:
- Heading: "Available today" (h2, left aligned)
- Right of heading, same line: timestamp "Fri 20 Nov, as of 08:10" in 0.875rem --muted-fg
- Subtitle: "The next free fitting bay at each branch, soonest first." (body, --muted-fg)
- Below: horizontal scroll rail of 7 cards, with scroll-snap

Card design (this is where the bold move lives):
- Cards are Level 1 elevation (shadow, no border)
- **The availability badge is at the TOP of the card, not the bottom.** It's the first thing you see.
  - Green badge "2 free": background rgba(34,197,94,0.1), color #16a34a, font-weight 600, 0.8125rem, border-radius 6px, padding 4px 10px
  - Orange badge "Last bay": background rgba(255,106,26,0.08), color --orange, same sizing. Add a subtle CSS animation: a slow pulse (opacity 0.7 to 1, 2s ease infinite) to create urgency
  - Grey badge "Full today": background rgba(0,0,0,0.04), color --muted-fg, text with line-through on the branch name or a muted treatment on the whole card (opacity: 0.6)
- Below badge: branch name (h3, Manrope 600)
- Postcode (0.875rem, --muted-fg)
- Spacer
- "Next bay" label (0.75rem, --muted-fg) + time in bold (1.125rem, --ink)
- Fitting price: "£25 per tyre fitted" (0.875rem, --muted-fg, price in Manrope 600)

Card width: 220px desktop, 200px mobile
Gap between cards: 16px

Mobile: Same horizontal scroll, 2 cards visible + peek of third. Scroll indicator bar below.

### 4. DEALS (moved up)
Background: --surface (#FFFFFF)

Desktop: Section heading "Best deals this week" (h2, no kicker above it). 4-column grid.

Each deal card (Level 1 elevation):
- Product image in a light grey container (background: #F3F3F3, border-radius: 12px, padding: 16px, aspect-ratio: 1/1). **Each card MUST have a different image placeholder.** Use different tyre-type illustrations or vary the angle/perspective. If only one tyre image exists, overlay a text label on each with the brand name to differentiate them visually.
- Below image: Brand name (0.8125rem, --muted-fg)
- Product name (h3, Manrope 600)
- Size spec (0.875rem, --muted-fg)
- Price row: was price (0.875rem, --muted-fg, text-decoration: line-through) + now price (1.25rem, Manrope 700, --orange)
- "per tyre" (0.75rem, --muted-fg)
- **"Save £X" badge** in the top-right corner of the image container. Background: --orange, color: white, font-weight: 600, 0.75rem, border-radius: 6px, padding: 3px 8px, position: absolute. Calculate save amount from was minus now price.

Mobile: **2-column grid (NOT horizontal scroll).** All 4 deals visible at once. Cards are smaller but all present. No horizontal scrolling for products you're trying to sell. Image container aspect-ratio: 1/1 still works. Price text sizes reduce slightly.

### 5. WHY GRIPWELL
Background: --graphite-2 (#1E2128). Text: white.

Heading: "Checkable, not claimed" (h2, white, centered or left-aligned)

Three trust points. **NO numbered markers.** Each point:
- Bold lead-in sentence (Manrope 600, white, 1.125rem) as the claim
- Supporting body text below (Manrope 400, rgba(255,255,255,0.7), 0.9375rem)
- Separated by generous padding (32px between points)

Desktop: 3-column layout, each point in its own column.
Mobile: Single column, stacked.

The three points:
1. "The price on the page is the price you pay" / "No hidden extras. VAT is included and fitting is shown per tyre fitted at each branch."
2. "A time on this page is a free bay" / "Next-bay times come from branch hours minus the fittings already booked. They are not estimates."
3. "Warranty claims start online" / "Send the claim form with photos from the warranty page. No phone tree, no branch visit to file."

### 6. SERVICES (moved down)
Background: --surface (#FFFFFF)

Heading: "What the hands actually do" (h2, no kicker)

Desktop: 3-column, 2-row grid. Each service card:
- Photo (aspect-ratio: 4/3, border-radius: 12px, object-fit: cover). **ALL SIX must have real photos. No grey placeholder boxes.** Use different Wikimedia workshop/mechanic photos. For "Balancing": use a photo of a wheel on a machine, or a close-up of wheel weights. For "Manufacturer service": use a photo of a car on a diagnostic lift or under-hood shot.
- Service name (h3, Manrope 600, below photo)
- Price or "Call to book" (0.875rem, --muted-fg)
- One-line description (0.875rem, --muted-fg, desktop only, hidden on mobile)

Services with their prices:
- Tyre fitting: "From £25 per tyre fitted"
- Wheel alignment: "Call to book"
- Balancing: "Included with fitting"
- Pre-MOT check: "Free"
- Puncture repair: "Call to book"
- Manufacturer service: "Call to book"

Mobile: 2-column grid, photos at aspect-ratio: 1/1 (square). Service name and price below. No descriptions. Cards need 12px gap between them. Each photo must be a real photo (fix the placeholder issue from Comp D).

### 7. BRANCHES
Background: --paper (#FAF8F4) ← creates visual separation from services section above

Heading: "7 branches across London" (h2, no kicker)

Desktop: 5/7 grid ratio. Left: Leaflet map with Esri Light Gray Canvas tiles and 7 orange pin markers. Right: branch cards in a 2-column grid.

Each branch card (Level 1 elevation):
- Street photo (aspect-ratio: 16/9, border-radius: 12px 12px 0 0, full width of card, object-fit: cover)
- Below photo: padding 16px
- Branch name (h3, Manrope 600)
- Address (0.875rem, --muted-fg)
- Open badge: green background pill, "Open" + "until 17:30" text
- "Next bay" + time (bold) + "from £X per tyre fitted" (--orange for price)

Production note (add as HTML comment): Map should be position:sticky in production so it follows the user as they scroll through branch cards.

Branch data:
- Camden: 14 Kentish Town Rd, NW1 9NX, Open until 17:30, 09:30, £25
- Shoreditch: 82 Brick Lane, E1 6RL, Open until 17:30, 09:30, £28
- Brixton: 31 Atlantic Rd, SW9 8HX, Open until 17:30, 10:00, £27
- Hammersmith: 5 King St, W6 9HR, Open until 17:30, 11:00, £32
- Islington: 118 Upper St, N1 1QP, Open until 17:30, 12:00, £30
- Greenwich: 47 Greenwich High Rd, SE10 8JL, Open until 17:30, 15:00, £35
- City: 9 Cheapside, EC2V 6AA, Open until 17:30, Tomorrow 08:00, £33

Mobile:
- Map: full width, 200px height
- Show first 3 branch cards (Camden, Shoreditch, Brixton) in a stacked list (small thumbnail left 80px square + details right)
- Below the 3rd card: a "Show all 7 branches" button (outline style, full width, --ink border, sentence case). For the comp, this can just be a styled button with no JS.

Hours line below all branch cards: "Mon-Fri 08:00-17:30, Sat 08:00-16:00, Sun closed" (0.8125rem, --muted-fg, centered)

### 8. NEWSLETTER
Background: --surface (#FFFFFF)

A centered card (Level 2 elevation, max-width: 560px, margin: auto, padding: 40px, border-radius: 16px):
- Heading: "Get deals and fitting reminders" (h2, centered)
- Body: "New stock in common sizes and a reminder when your tyres are due a check. One email a fortnight." (centered, --muted-fg)
- Form: email input + "Subscribe" button side by side
- Email input: border: 1px solid --line, border-radius: 10px, padding: 12px 16px, min-height: 48px
- Subscribe button: --orange bg, white text, border-radius: 10px, min-height: 48px, Manrope 600

Mobile: Same card but full-width with 16px side margin. Input and button stack vertically.

### 9. FOOTER
Background: --graphite (#2A2E36). Text: rgba(255,255,255,0.7).

Desktop: 3-column layout.
- Column 1: Logo (white version), one-line descriptor "London's tyre fitting service"
- Column 2: Quick links (About, Branches, Careers, Contact) in a list, sentence case
- Column 3: Contact info (phone, email, address)

Social icons in footer: Use transparent background with rgba(255,255,255,0.3) icons. NOT white circles. Very low visual weight. Icons for: Instagram, Facebook, X/Twitter (generic representations, no brand colours).

Mobile: Single column, stacked. Logo + descriptor, then links, then contact, then social icons.

### 10. MOBILE STICKY BOTTOM BAR (new)
On mobile only (hidden on desktop), a fixed bottom bar:
- Background: --surface (#FFFFFF) with box-shadow: 0 -1px 4px rgba(0,0,0,0.08)
- Height: 64px, padding: 8px 16px
- Contains one full-width CTA button: "Search tyres" (--orange bg, white text, border-radius: 10px, Manrope 600)
- This bar appears when the user scrolls past the hero CTA (the bar is always visible in the comp since we can't do scroll detection in static HTML)
- Add padding-bottom: 72px to the mobile page body so the footer isn't hidden behind the bar

## Technical notes
- Build this by editing `docs/design/comps/build_comps.py` and re-running it, same as previous comps
- Both desktop (1440px) and mobile (390px) in side-by-side iframes
- Use Wikimedia Commons photos with proper attribution in CREDITS.md. Find real photos for the two service placeholders (balancing, manufacturer service). Reference them with descriptive filenames.
- Leaflet + Esri Light Gray Canvas tiles for the map (keyless, same as Comp D)
- All prices in GBP, inclusive of 20% VAT
- Do NOT touch previous comps (a/ b/ c/ d/)
- Use only fictional tyre brand names: Kova, Meridian, Terrain X, Corsaro
- No fake reviews, no unbacked business claims
- SVG icons should be inline, minimal, monochrome (--muted-fg or white depending on background)

## After building
Run `/impeccable critique` on the generated comp to get a systematic quality review. Fix anything it flags before showing to the client.
