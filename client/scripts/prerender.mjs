// Runs after `vite build` (see root package.json "postbuild"). Generates a
// real, unique static index.html per route in dist/ so crawlers that don't
// execute JS (and social-media/SEO scrapers) see correct per-page titles,
// descriptions, canonical tags and body content instead of one shared shell.
//
// No headless browser involved — routes are rendered with
// react-dom/server (renderToStaticMarkup) via Vite's SSR module loader, so
// this can't break on a minimal build host the way a Puppeteer/Chromium step
// could.
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(CLIENT_DIR, 'dist');

function escapeForAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function replaceMetaContent(html, id, content) {
  const re = new RegExp(`(<meta id="${id}"[^>]*content=")[^"]*(")`);
  return html.replace(re, `$1${escapeForAttr(content)}$2`);
}

function buildRouteHtml(template, appHtml, meta, siteUrl, defaultTitle, defaultDescription) {
  const fullTitle = meta.title ? `${meta.title} | Crumbs & Cream` : defaultTitle;
  const description = meta.description || defaultDescription;
  const url = `${siteUrl}${meta.path}`;

  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeForAttr(fullTitle)}</title>`);
  html = replaceMetaContent(html, 'meta-description', description);
  html = replaceMetaContent(html, 'og-title', fullTitle);
  html = replaceMetaContent(html, 'og-description', description);
  html = replaceMetaContent(html, 'og-url', url);
  html = replaceMetaContent(html, 'twitter-title', fullTitle);
  html = replaceMetaContent(html, 'twitter-description', description);
  html = html.replace(
    /(<link id="canonical-link"[^>]*href=")[^"]*(")/,
    `$1${escapeForAttr(url)}$2`
  );
  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  return html;
}

async function main() {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    throw new Error('dist/index.html not found — run `vite build` before prerendering.');
  }

  const vite = await createServer({
    root: CLIENT_DIR,
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
    const { PAGE_META, SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION } =
      await vite.ssrLoadModule('/src/data/pageMeta.js');

    const template = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');
    const assetUrlMap = loadAssetUrlMap(DIST_DIR);

    for (const route of Object.keys(PAGE_META)) {
      const meta = PAGE_META[route];
      const appHtml = render(route);
      let html = buildRouteHtml(template, appHtml, meta, SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION);
      html = resolveDevAssetUrls(html, route, assetUrlMap);

      // Flat file, not `dist/<route>/index.html` — Cloudflare Pages
      // auto-redirects (308) directory-style `foo/index.html` requests
      // from `/foo` to `/foo/`, which would contradict the non-trailing-
      // slash canonical URL above. A flat `foo.html` is served by
      // Cloudflare at `/foo` with a 200, no redirect.
      const outFile = route === '/'
        ? path.join(DIST_DIR, 'index.html')
        : path.join(DIST_DIR, `${route.slice(1)}.html`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, html);
      console.log(`  prerendered ${route} -> ${path.relative(DIST_DIR, outFile)}`);
    }
  } finally {
    await vite.close();
    fs.rmSync(path.join(DIST_DIR, '.vite'), { recursive: true, force: true });
  }
}

// vite.ssrLoadModule() runs against Vite's *dev* module graph, so any
// `import x from '../assets/foo.webp'` resolves to the dev URL
// `/src/assets/foo.webp` instead of the hashed production URL `vite build`
// already wrote to dist/assets/. dist/.vite/manifest.json (from
// `build.manifest: true` in vite.config.js) maps source asset paths to
// their real hashed output, so we can rewrite every dev URL generically —
// no hardcoded filenames, so new assets under src/assets/ are covered too.
function loadAssetUrlMap(distDir) {
  const manifestPath = path.join(distDir, '.vite/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      'dist/.vite/manifest.json not found — ensure `build.manifest: true` is set ' +
      'in vite.config.js and `vite build` ran before prerendering.'
    );
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const assetUrlMap = new Map();
  for (const [srcPath, chunk] of Object.entries(manifest)) {
    if (srcPath.startsWith('src/assets/') && chunk.file) {
      assetUrlMap.set(`/${srcPath}`, `/${chunk.file}`);
    }
  }
  return assetUrlMap;
}

// Rewrites every /src/assets/... occurrence anywhere in the final HTML
// (img src, inline background-image url(...), any future <link>/<source>
// tag) to the matching production URL. Throws if an occurrence has no
// manifest entry, so a missed/renamed asset fails the build loudly instead
// of silently shipping a broken image.
function resolveDevAssetUrls(html, route, assetUrlMap) {
  return html.replace(/\/src\/assets\/[^"'()\s]+/g, (devUrl) => {
    const prodUrl = assetUrlMap.get(devUrl);
    if (!prodUrl) {
      throw new Error(`[prerender] no production asset found for "${devUrl}" on route "${route}" — check dist/.vite/manifest.json`);
    }
    return prodUrl;
  });
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
