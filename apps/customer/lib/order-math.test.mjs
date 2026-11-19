// Money-path checks. Run: npm test -w customer  (Node 24 runs the .ts modules directly).
// These are the exact functions the cart API, the payment route, the cart page
// and checkout call, so a pass here means the browser and the server agree.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isValidQuantity, checkCartLines } from './order-rules.ts'
import { quoteOrder, quoteOrderCents, money } from './fitting.ts'

// Server-side catalogue: the only source of prices.
const CATALOGUE = {
  'tyre:kova-apex-s3': 120.5,
  'tyre:meridian-trailmark': 199,
  'wheel:halden-outrider': 265,
  'wheel:odd-price': 99.99,
}
const priceOf = (type, slug) => CATALOGUE[`${type}:${slug}`]
const line = (productType, productId, quantity) => ({ productType, productId, quantity })

test('quantity must be a whole number from 1 to 8', () => {
  for (const bad of [-2, -1, 0, 0.5, 1.5, 9, 1e9, Infinity, NaN, '4', null, undefined]) {
    assert.equal(isValidQuantity(bad), false, `accepted ${String(bad)}`)
  }
  for (const ok of [1, 4, 8]) assert.equal(isValidQuantity(ok), true)
})

test('negative, zero, fractional and huge quantities are refused before any charge', () => {
  for (const q of [-2, 0, 2.5, 1000]) {
    const r = checkCartLines([line('tyre', 'kova-apex-s3', 4), line('wheel', 'halden-outrider', q)], priceOf)
    assert.equal(r.ok, false, `quantity ${q} got through`)
    assert.equal(r.status, 400)
  }
})

test('the reported exploit (4 tyres + a wheel at -2) can no longer price at £22', () => {
  const r = checkCartLines([line('tyre', 'kova-apex-s3', 4), line('wheel', 'halden-outrider', -2)], priceOf)
  assert.equal(r.ok, false)
})

test('per-type order limits: 8 tyres and 8 wheels', () => {
  assert.equal(checkCartLines([line('tyre', 'kova-apex-s3', 8)], priceOf).ok, true)
  const tyres = checkCartLines([line('tyre', 'kova-apex-s3', 5), line('tyre', 'meridian-trailmark', 4)], priceOf)
  assert.equal(tyres.ok, false)
  assert.match(tyres.error, /maximum of 8 tyres/)
  const wheels = checkCartLines([line('wheel', 'halden-outrider', 5), line('wheel', 'odd-price', 4)], priceOf)
  assert.equal(wheels.ok, false)
  assert.match(wheels.error, /maximum of 8 wheels/)
})

test('unknown or unpriced items are refused (409), never charged at £0', () => {
  const r = checkCartLines([line('tyre', 'kova-apex-s3', 4), line('tyre', 'nova-old-slug', 1)], priceOf)
  assert.equal(r.ok, false)
  assert.equal(r.status, 409)
  assert.deepEqual(r.unavailable, ['nova-old-slug'])
  assert.equal(checkCartLines([line('gift-card', 'x', 1)], priceOf).ok, false)
  assert.equal(checkCartLines([], priceOf).ok, false)
})

test('prices come from the server catalogue, not from anything the browser sends', () => {
  const r = checkCartLines([{ ...line('tyre', 'kova-apex-s3', 4), unitPrice: 0.01, price: 0.01 }], priceOf)
  assert.equal(r.ok, true)
  assert.equal(r.lines[0].unitPrice, 120.5)
})

test('4 × £120.50 fitted at £25 = £582.00, of which £97.00 is VAT', () => {
  const q = quoteOrderCents({ lines: [{ productType: 'tyre', quantity: 4, unitPrice: 120.5 }], fittingRate: 25, fit: true })
  assert.equal(q.subtotalCents, 48200)
  assert.equal(q.fittingCents, 10000)
  assert.equal(q.totalCents, 58200)
  assert.equal(q.vatCents, 9700)
})

test('fitting is charged per wheel position: 4 tyres + 4 wheels = 4 fittings, not 8', () => {
  const lines = [{ productType: 'tyre', quantity: 4, unitPrice: 199 }, { productType: 'wheel', quantity: 4, unitPrice: 265 }]
  const q = quoteOrderCents({ lines, fittingRate: 30, fit: true })
  assert.equal(q.positions, 4)
  assert.equal(q.fittingCents, 12000)
  assert.equal(q.totalCents, (4 * 199 + 4 * 265 + 4 * 30) * 100)
  // Uneven basket: 4 tyres + 2 wheels still needs 4 positions.
  assert.equal(quoteOrderCents({ lines: [lines[0], { ...lines[1], quantity: 2 }], fittingRate: 30, fit: true }).fittingCents, 12000)
})

test('fit count is clamped to the basket (a stale count from an old basket cannot overcharge)', () => {
  const lines = [{ productType: 'tyre', quantity: 4, unitPrice: 100 }]
  assert.equal(quoteOrderCents({ lines, fittingRate: 25, fit: true, fitCount: 10 }).fitCount, 4)
  assert.equal(quoteOrderCents({ lines, fittingRate: 25, fit: true, fitCount: 2 }).fittingCents, 5000)
  assert.equal(quoteOrderCents({ lines, fittingRate: 25, fit: true, fitCount: -3 }).fittingCents, 0)
  assert.equal(quoteOrderCents({ lines, fittingRate: 25, fit: false }).fittingCents, 0)
})

test('the total the cart and checkout display equals the total the server charges', () => {
  const baskets = [
    [{ productType: 'tyre', quantity: 4, unitPrice: 120.5 }],
    [{ productType: 'wheel', quantity: 3, unitPrice: 99.99 }],
    [{ productType: 'tyre', quantity: 2, unitPrice: 120.5 }, { productType: 'wheel', quantity: 4, unitPrice: 99.99 }],
    [{ productType: 'tyre', quantity: 8, unitPrice: 0.1 }, { productType: 'tyre', quantity: 0, unitPrice: 5 }],
  ]
  for (const lines of baskets) {
    for (const [fit, rate, fitCount] of [[true, 25, null], [true, 30, 2], [false, 50, null]]) {
      const shown   = quoteOrder({ lines, fittingRate: rate, fit, fitCount })       // cart / checkout
      const charged = quoteOrderCents({ lines, fittingRate: rate, fit, fitCount })  // payment route
      assert.equal(Math.round(shown.total * 100), charged.totalCents)
      assert.equal(Math.round(shown.vat * 100), charged.vatCents)
      assert.equal(Math.round(shown.fitting * 100), charged.fittingCents)
    }
  }
})

test('deal prices keep their pence: £120.50 never shows as £121', () => {
  assert.equal(money(120.5, { whole: true }), '£120.50')
  assert.equal(money(25, { whole: true }), '£25')
  assert.equal(money(1234.5), '£1,234.50')
})
