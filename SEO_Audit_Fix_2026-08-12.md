# SEO Audit Fix — 12 August 2026

**Project:** Crumbs & Cream
**Site:** https://crumbs-cream-production.up.railway.app
**Repo:** https://github.com/bloomtechmain/Crumbs---Cream
**Trigger:** `Crumbs_and_Cream_SEO_Audit_Report.pdf` (technical SEO audit dated 12 August 2026)
**Commit:** `394bea1` — pushed to `main`, Railway auto-deploys from this branch
**Purpose of this file:** record of what the audit found, what was fixed, and — most importantly — what was **not** fixed and why, so nobody assumes it's done.

---

## What the audit found

The site is a client-rendered React/Vite SPA. Every route (`/`, `/products`, `/delivery`, `/gallery`, `/reviews`, `/contact`) was returning **byte-for-byte identical `<head>` content** from the server — same title, same meta description, and a canonical tag that pointed every single page back to the homepage. There was no server-rendered body content either. In practice, search engines saw this as a one-page site; the canonical tags were actively telling Google to treat every subpage as a duplicate of the homepage.

## What was fixed

### 1. Per-route prerendering (the critical fix)
Per-page SEO code already existed (`usePageMeta.js`) but only ran **after** the JS loaded — invisible to any crawler or scraper reading the raw HTML. Added a build step that generates real static HTML per route:

- `client/src/entry-server.jsx` — renders any route to HTML using React's own server renderer (`react-dom/server`), no headless browser involved.
- `client/src/data/pageMeta.js` — single source of truth for each page's title/description, shared by the client-side hook and the build step (previously the two could drift apart).
- `client/scripts/prerender.mjs` — runs automatically as `postbuild` after every `vite build`. Writes `dist/products/index.html`, `dist/delivery/index.html`, etc., each with correct `<title>`, meta description, self-referencing canonical, Open Graph/Twitter tags, and real rendered body content.

**Also found and fixed a second bug while testing this:** Railway's start command used `serve -s` (single-page-app mode), which force-rewrites *every* request back to the homepage regardless of whether a real file exists at that path. This would have silently defeated the entire prerender fix. Removed `-s` from `railway.json` and `package.json` — verified live afterward that each route now serves its own file.

Verified with the exact method the audit report itself recommends (`curl` + grep on title/canonical) against a local server running the production build — all 6 routes confirmed correct before deploying.

### 2. Structured data (JSON-LD)
Built from the site's real data files, not invented:
- **Product** schema on `/products` — all 24 menu items (name, description, image, price, availability), from `client/src/data/products.js`.
- **Review + AggregateRating** schema on `/reviews` — all 8 existing customer reviews, from `client/src/data/reviews.js`.
- **Service** schema on `/delivery` — the 23 delivery suburbs, from `client/src/data/deliveryZones.js`.
- Added `telephone` and `email` to the existing site-wide Bakery schema (both already public on the Contact page).

### 3. Social share image + Twitter card
- `twitter:card` changed from `summary` (small square) to `summary_large_image`.
- The old `og:image`/`twitter:image` was the raw logo at 746×774 — not a proper social preview shape. Generated a new 1200×630 image by expanding the canvas around the existing logo (no new artwork, no invented branding) and wired it in as `/social-share.jpg`.

### 4. Housekeeping
- `sitemap.xml` `lastmod` dates refreshed to 2026-08-12.
- `robots.txt` / `sitemap.xml` — audit flagged these as "unverifiable," but they already existed and were already correct; left as-is.
- Alt text and descriptive image filenames — audit flagged these as a risk; checked every `<img>` in the codebase and all already have real alt text (product/page names, not generic labels), and product image filenames are already descriptive (`ferrero-rocher-cookie.jpg`, not `IMG_2381.jpg`). No changes needed.

---

## ⚠️ What was NOT fixed — the subdomain / custom domain

The audit's other MEDIUM-severity item: **move off `crumbs-cream-production.up.railway.app` onto a real, brandable domain** (e.g. `crumbsandcream.com.au`).

**This was not done, and can't be done by editing code.** It requires:
1. Buying/owning a domain (you confirmed you don't have one yet).
2. Pointing that domain's DNS at Railway.
3. Adding the domain in Railway's project settings.
4. Only *after* all three of those — updating every canonical URL, `sitemap.xml` entry, and `og:url`/`og:image` in the code to use the new domain instead of the Railway subdomain.

Nothing in the codebase blocks this — when you do get a domain, steps 1–3 are yours to do (registrar + Railway dashboard access needed), and step 4 is a quick follow-up ask for me. Until then, every URL in the site correctly points at the Railway subdomain, which is fully functional — just not as professional-looking in a shared link or in Google's search result snippet.

---

## Still open (lower priority, not requested this round)

- **Google Search Console** — resubmit `sitemap.xml` and request indexing for each of the 6 URLs once the deploy is confirmed live, to speed up Google picking up the fix (same manual steps as noted in `SEO_Status_2026-08-10.md`).
- **Gallery image filenames** — gallery photos are pulled dynamically from Google Drive via the worker, not stored in this repo, so their filenames/alt text depend on what's named in that Drive folder — outside this codebase's control.

---

## For whoever touches SEO files next

`git pull origin main` first — this pass touched `client/index.html`, `client/public/sitemap.xml`, `client/src/App.jsx`, `client/src/hooks/usePageMeta.js`, all 5 non-Home page files, `package.json`, `railway.json`, plus new files `client/src/entry-server.jsx`, `client/src/data/pageMeta.js`, `client/src/data/structuredData.js`, `client/scripts/prerender.mjs`, `client/public/social-share.jpg`.

If you add a new page/route in future, remember it needs an entry in `client/src/data/pageMeta.js` and a route in `client/src/App.jsx`'s `AppRoutes` — the prerender script reads routes from `PAGE_META`, so a route missing from there won't get a prerendered file (it'll still work for client-side navigation, just invisible to non-JS crawlers, same problem this whole file fixed).
