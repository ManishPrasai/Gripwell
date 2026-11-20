import { SITE_URL } from './site'

/* schema.org Product structured data for tyre/wheel PDPs — lets Google show
   price, stock and rating rich snippets in search results. Only include a
   `rating` when it's the same number actually shown on the page: structured
   data must match visible content or Google can ignore/penalize it. */
export interface ProductSchemaInput {
  path: string
  brand: string
  name: string
  description?: string
  images: string[]
  sku: string
  price: number
  inStock: boolean
  rating?: { value: number; count: number }
}

const absoluteUrl = (src: string) => encodeURI(src.startsWith('http') ? src : `${SITE_URL}${src}`)

export function buildProductSchema(input: ProductSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    image: input.images.map(absoluteUrl),
    sku: input.sku,
    brand: { '@type': 'Brand', name: input.brand },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(input.path),
      priceCurrency: 'GBP',
      price: input.price.toFixed(2),
      availability: input.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(input.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: input.rating.value.toFixed(1),
        reviewCount: input.rating.count,
      },
    } : {}),
  }
}
