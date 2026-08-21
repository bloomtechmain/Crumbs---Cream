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

    for (const route of Object.keys(PAGE_META)) {
      const meta = PAGE_META[route];
      const appHtml = render(route);
      const html = buildRouteHtml(template, appHtml, meta, SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION);

      const outDir = route === '/' ? DIST_DIR : path.join(DIST_DIR, route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html);
      console.log(`  prerendered ${route}`);
    }
  } finally {
    await vite.close();
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
