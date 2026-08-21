export const SITE_URL = 'https://crumbs-cream-production.up.railway.app';
export const DEFAULT_TITLE = 'Crumbs & Cream | Homemade Cookies & Cakes, South East Melbourne';
export const DEFAULT_DESCRIPTION = 'Crumbs & Cream — homemade cookies, brownies & cupcakes baked fresh in South East Melbourne. Order online today.';

// Single source of truth for per-route SEO metadata, consumed by usePageMeta
// (client-side head updates) and scripts/prerender.mjs (static per-route HTML).
export const PAGE_META = {
  '/': {
    path: '/',
  },
  '/products': {
    title: 'Menu — Cookies, Brownies & Cupcakes',
    description: 'Build your own box of handcrafted cookies, brownies, cupcakes and matcha treats. Freshly baked to order in South East Melbourne.',
    path: '/products',
  },
  '/delivery': {
    title: 'Delivery & Pickup Info',
    description: 'Delivery and local pickup info for Crumbs & Cream, South East Melbourne. See zones, fees and how to arrange your order.',
    path: '/delivery',
  },
  '/gallery': {
    title: 'Gallery',
    description: 'Photos of our handcrafted cookies, brownies and cupcakes — a look at what we bake fresh in South East Melbourne.',
    path: '/gallery',
  },
  '/reviews': {
    title: 'Customer Reviews',
    description: "See what our customers say about Crumbs & Cream's homemade cookies, brownies and cupcakes in South East Melbourne.",
    path: '/reviews',
  },
  '/contact': {
    title: 'Contact Us',
    description: 'Get in touch with Crumbs & Cream to place an order or ask a question. Email us — we usually reply within 24 hours.',
    path: '/contact',
  },
};
