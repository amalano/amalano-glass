/**
 * Base-path aware URL helpers.
 *
 * The site targets the custom domain root (base `/`), but routing every internal
 * link and public asset through `href()` keeps the build portable: if it is ever
 * served from a project subpath (e.g. a GitHub Pages `/repo/` URL before DNS is
 * configured), setting `base` in astro.config makes every link follow along.
 */

const BASE: string = import.meta.env?.BASE_URL ?? '/';

/** Prefix a root-absolute path with the configured base, avoiding double slashes. */
export function href(path: string): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}` || '/';
}

/** Build an absolute URL (for canonical/OG tags) from a root-absolute path. */
export function absoluteUrl(path: string, origin: string): string {
  return new URL(href(path), origin).toString();
}
