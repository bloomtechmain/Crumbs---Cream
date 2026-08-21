import { getAccessToken } from './auth';
import { getImageStream, listImages } from './drive';
import { sendOrderEmail } from './email';
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

      if (request.method !== 'GET') {
        return errorResponse('Method not allowed', 405);
      }

      if (url.pathname === '/api/gallery') {
        return await handleGallery(env, ctx, request);
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
