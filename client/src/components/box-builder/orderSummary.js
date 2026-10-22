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

// Sends a custom cake enquiry plus any reference photos. The worker stores the
// photos and links them in the email. Throws on failure, with the worker's
// message when the problem is the upload itself (e.g. a file too large).
export async function submitCakeEnquiry(summary, photos) {
  const form = new FormData();
  form.append('summary', summary);
  photos.forEach((p) => form.append('photos', p, p.name));

  const res = await fetch(`${API_BASE}/api/cake-enquiry`, { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(res.status === 400 && body?.error ? body.error : 'Enquiry request failed');
  }
}
