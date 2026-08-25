/**
 * Stripe client for the admin worker.
 *
 * On Cloudflare Workers the default Node HTTP client hangs, so we MUST use
 * `Stripe.createFetchHttpClient()`. Lazily constructed so importing this file
 * never throws when STRIPE_SECRET_KEY is unset (e.g. during build).
 */
import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  _stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia', httpClient: Stripe.createFetchHttpClient() })
  return _stripe
}
