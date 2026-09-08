/* Canonical public origin for the customer site. Used to build absolute URLs
   (email CTAs, JSON-LD structured data, sitemap/robots) where a relative
   path won't do. Override with NEXT_PUBLIC_SITE_URL once a real domain is
   wired up — the fallback is the current VPS deployment, not the old
   Cloudflare Workers URL from before the move to Vultr. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.207.148.82.84.sslip.io'
