import sharp from 'sharp';
import { readdir, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, '..');

// Full-resolution originals live here — this folder is the single source of
// truth. Drop the best copy of each photo in (jpg/png/webp, any size) and
// re-run `npm run optimize:images`. Nothing here is ever modified or deleted.
const mastersDir = path.join(clientDir, 'images-src');

// Responsive product photos go here (served verbatim from /images/...).
const imagesOutDir = path.join(clientDir, 'public/images');
// Page hero backgrounds and logos are bundled by Vite from here.
const assetsOutDir = path.join(clientDir, 'src/assets');

// Width variants generated for every product photo. <ProductImage> builds a
// srcset from exactly these numbers, so keep the two in sync.
const PRODUCT_WIDTHS = [400, 800, 1200];
const PRODUCT_QUALITY = { 400: 78, 800: 78, 1200: 75 };

// name (without extension) -> { dir, widths: [{ w, q, suffix }] }
// Heroes render as full-bleed `background-image` behind dimmed text, so one
// generously sized file is enough — no srcset needed.
const SPECIAL = {
  'products-hero': { dir: assetsOutDir, widths: [{ w: 2400, q: 72, suffix: '' }] },
  'home-hero':     { dir: assetsOutDir, widths: [{ w: 2400, q: 72, suffix: '' }] },
  'logo':          { dir: assetsOutDir, widths: [{ w: 200,  q: 82, suffix: '' }] },
  'rizedigit-logo':{ dir: assetsOutDir, widths: [{ w: 200,  q: 82, suffix: '' }] },
};

// Extra clockwise rotation (degrees) applied after EXIF auto-orient, for
// masters that were shot in the wrong orientation. Keyed by name (no extension).
const MANUAL_ROTATE = {
  'biscoff-cookie': 90,
  'oreo-white-chocolate-cookie': 90,
};

// Square-crop gravity override. Product photos default to `attention` (pick the
// busiest region), but that can sit a centred subject too high — force a plain
// centred crop for those. Keyed by name (no extension).
const CROP_POSITION = {
  'biscoff-cookie': 'centre',
  'oreo-white-chocolate-cookie': 'centre',
  'red-velvet-cookie': 'centre',
  'matcha-white-chocolate-cookie': 'centre',
  'matcha-strawberry-cookie': 'centre',
  'pistachio-brownie': 'centre',
};

// Extra zoom for the square crop (1 = none). >1 tightens the frame around the
// subject when the photo was shot with too much empty margin. Keyed by name.
const CROP_ZOOM = {
  'oreo-white-chocolate-cookie': 1.3,
  'pistachio-brownie': 1.7,
};

const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

// First run: seed images-src/ from the images already in the repo so the
// pipeline works immediately. Replace these with true high-res originals later.
async function bootstrapMasters() {
  if (existsSync(mastersDir)) return;
  console.log('images-src/ not found — seeding it from existing images…');
  await mkdir(mastersDir, { recursive: true });

  const seeds = [];
  if (existsSync(imagesOutDir)) {
    for (const entry of await readdir(imagesOutDir)) {
      // Skip any width-variant files from a previous run.
      if (IMAGE_RE.test(entry) && !/-\d+\.webp$/i.test(entry)) {
        seeds.push([path.join(imagesOutDir, entry), path.join(mastersDir, entry)]);
      }
    }
  }
  for (const name of ['products-hero.webp', 'logo.webp', 'rizedigit-logo.webp']) {
    const from = path.join(assetsOutDir, name);
    if (existsSync(from)) seeds.push([from, path.join(mastersDir, name)]);
  }
  for (const [from, to] of seeds) {
    await copyFile(from, to);
    console.log(`  seeded ${path.basename(to)}`);
  }
}

async function emit(masterPath, outDir, width, quality, suffix, square = false) {
  const name = path.basename(masterPath, path.extname(masterPath));
  const outPath = path.join(outDir, `${name}${suffix}.webp`);
  const pipeline = sharp(masterPath).rotate(); // .rotate() honours EXIF orientation
  if (MANUAL_ROTATE[name]) pipeline.rotate(MANUAL_ROTATE[name]); // fix a mis-shot master

  if (square) {
    // Every consumer shows product photos in an `aspect-square` box with
    // `object-cover`, so crop to a square here. `attention` locks the crop
    // onto the busiest region — the cookie and its toppings — instead of the
    // empty background above it in the portrait phone shots.
    const zoom = CROP_ZOOM[name] ?? 1;
    const box = Math.round(width * zoom);
    pipeline.resize(box, box, {
      fit: 'cover',
      position: CROP_POSITION[name] ?? sharp.strategy.attention,
      withoutEnlargement: zoom === 1,
    });
    if (zoom !== 1) {
      const off = Math.round((box - width) / 2);
      pipeline.extract({ left: off, top: off, width, height: width });
    }
  } else {
    pipeline.resize({ width, withoutEnlargement: true });
  }

  await pipeline.webp({ quality }).toFile(outPath);
  console.log(`  ${name}${suffix}.webp  (${width}w q${quality}${square ? ' square' : ''})`);
}

async function run() {
  await bootstrapMasters();

  if (!existsSync(mastersDir)) {
    console.error(`No masters directory at ${path.relative(clientDir, mastersDir)} — nothing to do.`);
    process.exit(1);
  }

  await mkdir(imagesOutDir, { recursive: true });
  await mkdir(assetsOutDir, { recursive: true });

  const entries = (await readdir(mastersDir)).filter((e) => IMAGE_RE.test(e));
  if (entries.length === 0) {
    console.error(`No images in ${path.relative(clientDir, mastersDir)}.`);
    process.exit(1);
  }

  for (const entry of entries) {
    const masterPath = path.join(mastersDir, entry);
    const name = path.basename(entry, path.extname(entry));
    const special = SPECIAL[name];

    if (special) {
      console.log(`${entry} ->`);
      for (const { w, q, suffix } of special.widths) {
        await emit(masterPath, special.dir, w, q, suffix);
      }
    } else {
      console.log(`${entry} ->`);
      for (const w of PRODUCT_WIDTHS) {
        await emit(masterPath, imagesOutDir, w, PRODUCT_QUALITY[w], `-${w}`, true);
      }
      // Plain path kept as the <img src> fallback and for any non-srcset consumer.
      await emit(masterPath, imagesOutDir, 1200, PRODUCT_QUALITY[1200], '', true);
    }
  }

  const heroMissing = ['products-hero', 'home-hero'].filter(
    (n) => !entries.some((e) => path.basename(e, path.extname(e)) === n),
  );
  if (heroMissing.length) {
    console.warn(`\nNote: no master for ${heroMissing.join(', ')} — add ${heroMissing
      .map((n) => `images-src/${n}.jpg`)
      .join(' / ')} and re-run.`);
  }

  console.log('\nDone.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
