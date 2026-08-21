import { SITE_URL } from './pageMeta';

const BUSINESS = { '@type': 'Bakery', name: 'Crumbs & Cream', url: SITE_URL };

export function buildProductListSchema(products) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products
      .filter((p) => p.is_available)
      .map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          description: p.description,
          image: p.image_url ? `${SITE_URL}${p.image_url}` : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'AUD',
            price: p.price,
            availability: 'https://schema.org/InStock',
          },
        },
      })),
  };
}

export function buildReviewSchema(reviews) {
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    ...BUSINESS,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(avg.toFixed(1)),
      reviewCount: reviews.length,
      bestRating: 5,
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.customer_name },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.review_text,
      datePublished: r.created_at,
    })),
  };
}

export function buildDeliveryServiceSchema(zones) {
  const suburbs = [...new Set(zones.filter((z) => z.is_available).map((z) => z.suburb))];

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Bakery delivery',
    provider: BUSINESS,
    areaServed: suburbs.map((name) => ({ '@type': 'City', name })),
  };
}
