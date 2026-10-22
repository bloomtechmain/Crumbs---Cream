import type { Env } from './types';

export const MAX_CAKE_PHOTOS = 5;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4MB — the site compresses before upload, so this is a safety cap
const PHOTO_TTL_SECONDS = 60 * 60 * 24 * 180; // keep reference photos ~6 months

/** Stores customer reference photos in KV under random, unguessable keys and
 * returns their public URLs (served back by `getCakePhoto`). */
export async function storeCakePhotos(env: Env, origin: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith('image/')) throw new PhotoError(`"${file.name}" is not an image.`);
    if (file.size > MAX_PHOTO_BYTES) throw new PhotoError(`"${file.name}" is too large (max 4MB).`);

    const id = crypto.randomUUID();
    await env.CAKE_PHOTOS.put(id, await file.arrayBuffer(), {
      expirationTtl: PHOTO_TTL_SECONDS,
      metadata: { contentType: file.type },
    });
    urls.push(`${origin}/api/cake-photo/${id}`);
  }
  return urls;
}

export async function getCakePhoto(env: Env, id: string): Promise<Response | null> {
  const { value, metadata } = await env.CAKE_PHOTOS.getWithMetadata<{ contentType?: string }>(id, 'arrayBuffer');
  if (!value) return null;
  return new Response(value, {
    headers: {
      'Content-Type': metadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'private, max-age=86400',
    },
  });
}

/** A problem with the customer's upload (bad type/size) — reported as a 400. */
export class PhotoError extends Error {}
