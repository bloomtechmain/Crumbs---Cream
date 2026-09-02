// Responsive product photo.
//
// `src` is the canonical path stored in data/products.js, e.g.
// "/images/ferrero-rocher-cookie.webp" (an optional "?v=3" cache-buster is
// preserved on every variant URL). The width variants are produced by
// scripts/optimize-images.mjs: foo-400.webp / foo-800.webp / foo-1200.webp.
//
// `sizes` should describe how wide the image renders at each breakpoint so the
// browser can pick the smallest variant that still looks sharp on the device's
// pixel ratio. Without it the browser assumes 100vw and over-downloads on phones.

const WIDTHS = [400, 800, 1200];

export default function ProductImage({
  src,
  alt,
  className,
  sizes,
  loading = 'lazy',
  ...rest
}) {
  const [path, query] = String(src).split('?');
  const base = path.replace(/\.webp$/i, '');
  const q = query ? `?${query}` : '';
  const srcSet = WIDTHS.map((w) => `${base}-${w}.webp${q} ${w}w`).join(', ');

  return (
    <img
      src={`${base}-800.webp${q}`}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      {...rest}
    />
  );
}
