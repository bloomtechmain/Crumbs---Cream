# Crumbs & Cream — Gallery Worker

A Cloudflare Worker that serves the live photo gallery from a Google Drive folder, so
a non-technical admin can add new photos without any code change or redeploy.

```
React Frontend (Cloudflare Pages)
        |  fetch /api/gallery, /api/image/:id
Cloudflare Worker (this project)
        |  Google Drive API (service account, read-only)
Google Drive Gallery Folder
```

The Drive folder stays **private** — it's shared only with the service account's
email, never with "anyone with the link". The Worker holds the only credentials
able to read it, and the frontend never sees them.

## Endpoints

- `GET /api/gallery` → `{ images: [{ id, name, url, createdDate }] }`, newest first.
  `url` is a relative path (`/api/image/<id>`) back into this Worker. Cached at the
  edge for 5 minutes.
- `GET /api/image/:id` → the raw image bytes, proxied from Drive. Cached at the edge
  for 1 day.

CORS is currently set to allow any origin (`Access-Control-Allow-Origin: *`) in
`src/index.ts`, since the Cloudflare Pages URL isn't known yet. Once the site has a
real domain, narrow `CORS_HEADERS` in that file to just that origin.

## One-time Google Cloud setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project (or use an existing one).
2. **APIs & Services → Library** → enable the **Google Drive API**.
3. **APIs & Services → Credentials → Create Credentials → Service Account**. Give it any name (e.g. `gallery-reader`), no roles needed.
4. Open the new service account → **Keys → Add Key → Create new key → JSON**. This downloads a JSON file — keep it private, it's a credential.
5. In that JSON file, note down:
   - `client_email` → this is `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → this is `GOOGLE_PRIVATE_KEY` (keep the `\n` characters as-is)
6. In Google Drive, create (or pick) the folder that will hold gallery photos. Right-click it → **Share** → paste the service account's `client_email` → give it **Viewer** access. The folder does *not* need to be shared with anyone else or made public.
7. Copy the folder's ID from its URL: `https://drive.google.com/drive/folders/<THIS_PART_IS_THE_ID>`.

## Local development

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars
# edit .dev.vars with the real service account email, private key, and folder ID
npm run dev
```

This starts the Worker at `http://localhost:8787`. With the client's
`client/.env.development` pointing `VITE_GALLERY_API_URL` at that same address
(already set up), running the client dev server will hit this local Worker.

## Deploying

```bash
cd worker
npm install
npx wrangler login          # one-time, opens a browser to connect your Cloudflare account
wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
wrangler secret put GOOGLE_PRIVATE_KEY
```

Then edit `wrangler.toml` and replace `GOOGLE_DRIVE_FOLDER_ID` under `[vars]` with
the real folder ID (this one isn't sensitive, so it lives in the committed config
rather than as a secret).

```bash
npm run deploy
```

This prints the Worker's live URL (something like
`https://crumbs-and-cream-gallery.<your-subdomain>.workers.dev`).

## Deploying the frontend (Cloudflare Pages)

1. In the Cloudflare dashboard, **Workers & Pages → Create → Pages → connect your Git repo**.
2. Build settings: build command `cd client && npm run build`, output directory `client/dist`.
3. **Settings → Environment variables** → add `VITE_GALLERY_API_URL` set to the Worker URL from the deploy step above.
4. Deploy. This is a separate deployment path from the current Railway hosting — Railway keeps running the existing static build until you're ready to fully cut over to Cloudflare.

## How this works for a non-technical admin

1. Open the shared Google Drive folder (bookmark it).
2. Drag a new photo in, or delete one you no longer want shown.
3. Refresh the gallery page on the website. New photos usually appear immediately;
   in rare cases it can take up to 5 minutes because of edge caching.

No code, no redeploy, no developer needed for day-to-day photo updates.

Once this is live, the temporary `/admin` page in the main site
(`client/src/pages/Admin.jsx`, a "prep photos + copy code for a developer to add"
helper) is no longer needed and can be removed.
