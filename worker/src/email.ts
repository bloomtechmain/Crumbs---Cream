import type { Env } from './types';

interface OrderPayload {
  summary: string;
  couponCode?: string;
}

export async function sendOrderEmail(env: Env, payload: OrderPayload): Promise<void> {
  const message = payload.couponCode?.trim()
    ? `${payload.summary}\nCoupon code: ${payload.couponCode.trim()}`
    : payload.summary;

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: env.EMAILJS_SERVICE_ID,
      template_id: env.EMAILJS_TEMPLATE_ID,
      user_id: env.EMAILJS_PUBLIC_KEY,
      accessToken: env.EMAILJS_PRIVATE_KEY,
      template_params: { message },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`EmailJS request failed (${response.status}): ${body}`);
  }
}
