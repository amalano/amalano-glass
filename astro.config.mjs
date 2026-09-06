// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical production origin (custom domain). Used for canonical URLs,
// absolute OG tags, and the generated sitemap.
const SITE = 'https://glasses.amalano.dev';

// Default to the domain root. The build stays portable: set SITE_BASE (e.g.
// "/amalano-glass/") to serve from a GitHub Pages project subpath before DNS
// for the custom domain is configured — every internal link routes through
// `href()`/`import.meta.env.BASE_URL`, so links follow the base automatically.
const BASE = process.env.SITE_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  // A static concept site: no server runtime, no remote data dependency.
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // Draft catalog has no per-product routes; keep the sitemap to real pages.
      filter: (page) => !page.includes('/404'),
    }),
  ],
  // Local images (src/assets) are optimized at build time by Astro's default
  // sharp service; widths/formats are set per-<Image> in the components.
});
