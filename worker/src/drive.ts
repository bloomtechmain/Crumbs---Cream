import type { DriveFile, Env, GalleryImage } from './types';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const MAX_GALLERY_IMAGES = 15;
const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB

/** Lists image files in the configured Drive folder, newest first, capped at
 * MAX_GALLERY_IMAGES and skipping anything over MAX_IMAGE_BYTES. */
export async function listImages(env: Env, accessToken: string): Promise<GalleryImage[]> {
  const q = `'${env.GOOGLE_DRIVE_FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`;
  const params = new URLSearchParams({
    q,
    orderBy: 'createdTime desc',
    fields: 'files(id,name,mimeType,createdTime,size)',
    pageSize: '100',
  });

  const res = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive files.list failed (${res.status}): ${body}`);
  }

  const data = await res.json<{ files: DriveFile[] }>();

  return (data.files ?? [])
    .filter((file) => !file.size || Number(file.size) <= MAX_IMAGE_BYTES)
    .slice(0, MAX_GALLERY_IMAGES)
    .map((file) => ({
      id: file.id,
      name: file.name,
      url: `/api/image/${file.id}`,
      createdDate: file.createdTime,
    }));
}

/** Streams a single image's bytes straight from Drive, preserving content-type. */
export async function getImageStream(
  env: Env,
  accessToken: string,
  fileId: string
): Promise<Response> {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive file download failed (${res.status}): ${body}`);
  }

  return res;
}
