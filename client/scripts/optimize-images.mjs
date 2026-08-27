import sharp from 'sharp';
import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.resolve(__dirname, '..');

async function convert(filePath, { maxWidth, quality }) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const outPath = path.join(dir, `${base}.webp`);

  await sharp(filePath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);

  await unlink(filePath);
  console.log(`${path.relative(clientDir, filePath)} -> ${path.relative(clientDir, outPath)}`);
}

async function processDir(dir, opts) {
  const entries = await readdir(dir);
  for (const entry of entries) {
    if (/\.(jpe?g|png)$/i.test(entry)) {
      await convert(path.join(dir, entry), opts);
    }
  }
}

await processDir(path.join(clientDir, 'public/images'), { maxWidth: 800, quality: 80 });
await convert(path.join(clientDir, 'src/assets/logo.jpg'), { maxWidth: 200, quality: 82 });
await convert(path.join(clientDir, 'src/assets/rizedigit-logo.jpeg'), { maxWidth: 200, quality: 82 });
await convert(path.join(clientDir, 'src/assets/products-hero.jpg'), { maxWidth: 1920, quality: 78 });

console.log('Done.');
