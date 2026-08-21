import type { Env } from './types';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_READONLY_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const normalized = pem.replace(/\\n/g, '\n');
  const base64 = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function signJwt(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: DRIVE_READONLY_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64UrlEncodeString(JSON.stringify(header))}.${base64UrlEncodeString(JSON.stringify(claims))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(env.GOOGLE_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${base64UrlEncode(signature)}`;
}

// Reused across requests for as long as the isolate stays warm, so most
// requests skip the Google OAuth round-trip entirely instead of repeating it
// (and its occasional transient failures) on every single call.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function requestAccessToken(env: Env): Promise<{ token: string; expiresIn: number }> {
  const jwt = await signJwt(env);

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to obtain Google access token (${res.status}): ${body}`);
  }

  const data = await res.json<{ access_token: string; expires_in: number }>();
  return { token: data.access_token, expiresIn: data.expires_in };
}

/** Exchanges the service account's signed JWT for a Drive-readonly access token,
 * caching it in memory until shortly before it expires. Retries once on failure
 * to absorb a single transient hiccup from Google's token endpoint. */
export async function getAccessToken(env: Env): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.token;

  try {
    const { token, expiresIn } = await requestAccessToken(env);
    cachedToken = { token, expiresAt: now + (expiresIn - 60) * 1000 };
    return token;
  } catch {
    const { token, expiresIn } = await requestAccessToken(env);
    cachedToken = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
    return token;
  }
}
