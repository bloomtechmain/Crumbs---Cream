const ORDER_EMAIL = 'orders.crumbsandcream@gmail.com';
const API_BASE = import.meta.env.VITE_GALLERY_API_URL || '';

export function mailtoLink(subject, body) {
  return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatPrice(amount) {
  return `A$${amount.toFixed(2)}`;
}

// Sends the order to the bakery inbox via the Cloudflare Worker (which relays
// through EmailJS). Throws on failure so the caller can fall back to mailto.
export async function submitOrder(summary, couponCode) {
  const res = await fetch(`${API_BASE}/api/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary, couponCode }),
  });
  if (!res.ok) throw new Error('Order request failed');
}
