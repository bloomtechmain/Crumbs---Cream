// Fixed box/pack pricing per Cookies.docx (2026-08-20). These override the
// per-unit flavour prices in products.js once a box is fully allocated.

export const COOKIE_BOX_PRICES = { classic: 20, premium: 28, mixed: 25, matcha: 30 };

export const BROWNIE_BOX_PRICES = { 9: 30, 16: 45, 25: 65 };

export const CUPCAKE_PACK_PRICES = {
  'Vanilla Bean Cupcake':    { 4: 15,   6: 24,    12: 45, 24: 85 },
  'Chocolate Fudge Cupcake': { 4: 21,   6: 31.50, 12: 60, 24: 115 },
  'Red Velvet Cupcake':      { 4: 22,   6: 33,    12: 63, 24: 120 },
};

// A box of 4 classic-only, premium-only or matcha-only cookies gets its
// tier's fixed price. A classic+premium mix of 4 gets the Mix & Match price.
// Any other combination (e.g. matcha mixed with classic/premium) isn't a
// priced bundle, so it falls back to individual cookie pricing.
export function cookieBoxPrice(items) {
  const tiers = new Set(items.map((it) => it.tier));
  if (tiers.size === 1) {
    const [tier] = tiers;
    return COOKIE_BOX_PRICES[tier] ?? null;
  }
  if (tiers.has('classic') && tiers.has('premium') && !tiers.has('matcha')) {
    return COOKIE_BOX_PRICES.mixed;
  }
  return null;
}

export function brownieBoxPrice(_items, size) {
  return BROWNIE_BOX_PRICES[size] ?? null;
}
