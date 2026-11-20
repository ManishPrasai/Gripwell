# Gripwell brand files

Copy this folder to `public/brand/` in the Next.js project.

| File | Use |
|---|---|
| logo-horizontal.svg | Default logo on light backgrounds (site header) |
| logo-horizontal-mono.svg | One colour graphite |
| logo-horizontal-white.svg / logo-white.svg | All white, on graphite or photos |
| logo-horizontal-reversed.svg | Warm white + orange dash, on dark (#0F1115) |
| logo-stacked*.svg | Square-ish spaces (same four versions) |
| icon*.svg | Mark only, square |
| icon-app.svg, icon-512.png, icon-192.png, apple-touch-icon.png | App icon on graphite tile |
| favicon.svg | Small-size cut, switches to warm white in dark mode |
| favicon.ico | 16/32/48 px fallback |
| og-image.png | 1200 x 630 social share image |
| brand-guide.pdf / .html | One-page brand guide |

```tsx
// app/layout.tsx
export const metadata = {
  title: "Gripwell",
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }, { url: "/brand/favicon.ico", sizes: "any" }],
    apple: "/brand/apple-touch-icon.png",
  },
  manifest: "/brand/site.webmanifest",
  openGraph: { images: [{ url: "/brand/og-image.png", width: 1200, height: 630 }] },
};
```

Fonts: Manrope Bold (SIL Open Font License), converted to outlines. All logo SVGs contain paths only.
Gripwell is a fictional brand made for a portfolio demo.
