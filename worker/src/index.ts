import { getAccessToken } from './auth';
import { getImageStream, listImages } from './drive';
import { MAX_CAKE_PHOTOS, PhotoError, getCakePhoto, storeCakePhotos } from './cakePhotos';
import { sendEmail, sendOrderEmail } from './email';
import type { Env } from './types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

function errorResponse(message: string, status: number): Response {
  return withCors(
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

async function handleGallery(env: Env, ctx: ExecutionContext, request: Request): Promise<Response> {
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return withCors(cached);

  const token = await getAccessToken(env);
  const images = await listImages(env, token);

  const response = new Response(JSON.stringify({ images }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });

  ctx.waitUntil(cache.put(request, response.clone()));
  return withCors(response);
}

async function handleImage(
  env: Env,
  ctx: ExecutionContext,
  request: Request,
  fileId: string
): Promise<Response> {
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return withCors(cached);

  const token = await getAccessToken(env);
  const driveResponse = await getImageStream(env, token, fileId);

  const response = new Response(driveResponse.body, {
    headers: {
      'Content-Type': driveResponse.headers.get('content-type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    },
  });

  ctx.waitUntil(cache.put(request, response.clone()));
  return withCors(response);
}

async function handleOrder(env: Env, request: Request): Promise<Response> {
  const body = await request.json<{ summary?: unknown; couponCode?: unknown }>().catch(() => null);

  if (!body || typeof body.summary !== 'string' || !body.summary.trim()) {
    return errorResponse('Missing order summary.', 400);
  }

  await sendOrderEmail(env, {
    summary: body.summary,
    couponCode: typeof body.couponCode === 'string' ? body.couponCode : undefined,
  });

  return withCors(new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  }));
}

async function handleCakeEnquiry(env: Env, request: Request): Promise<Response> {
  const form = await request.formData().catch(() => null);
  const summary = form?.get('summary');

  if (typeof summary !== 'string' || !summary.trim()) {
    return errorResponse('Missing enquiry details.', 400);
  }

  const photos = form!.getAll('photos').filter((p): p is File => p instanceof File && p.size > 0);
  if (photos.length > MAX_CAKE_PHOTOS) {
    return errorResponse(`Please upload at most ${MAX_CAKE_PHOTOS} photos.`, 400);
  }

  let photoUrls: string[];
  try {
    photoUrls = await storeCakePhotos(env, new URL(request.url).origin, photos);
  } catch (err) {
    if (err instanceof PhotoError) return errorResponse(err.message, 400);
    throw err;
  }

  const message = photoUrls.length
    ? `${summary}\n\nReference photos:\n${photoUrls.join('\n')}`
    : summary;
  await sendEmail(env, message);

  return withCors(new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  }));
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/order') {
        if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
        return await handleOrder(env, request);
      }

      if (url.pathname === '/api/cake-enquiry') {
        if (request.method !== 'POST') return errorResponse('Method not allowed', 405);
        return await handleCakeEnquiry(env, request);
      }

      if (request.method !== 'GET') {
        return errorResponse('Method not allowed', 405);
      }

      if (url.pathname === '/api/gallery') {
        return await handleGallery(env, ctx, request);
      }

      const cakePhotoMatch = url.pathname.match(/^\/api\/cake-photo\/([0-9a-f-]{36})$/);
      if (cakePhotoMatch) {
        const photo = await getCakePhoto(env, cakePhotoMatch[1]);
        return photo ? withCors(photo) : errorResponse('Not found', 404);
      }

      const imageMatch = url.pathname.match(/^\/api\/image\/([^/]+)$/);
      if (imageMatch) {
        return await handleImage(env, ctx, request, imageMatch[1]);
      }

      return errorResponse('Not found', 404);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unexpected error';
      return errorResponse(message, 502);
    }
  },
};
