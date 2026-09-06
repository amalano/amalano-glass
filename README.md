# Amalano Glass

A public, **static Astro** storefront **concept** for `glasses.amalano.dev` — a
design study for a small line of stemware (the Universal, the Burgundy, and the
Coupe).

> **Pre-launch, and honest about it.** This is not a live store. Nothing is for
> sale, no order can be placed, and no personal or payment data is collected. The
> catalog, prices, and imagery are concept work — see the boundaries below.

## What's real vs. concept

- **Imagery is a concept.** Everything in `src/assets/images/` is original,
  **AI-generated concept photography** created for this study — not photographs of
  finished, purchasable products. A build-optimized social image lives at
  `public/og/og-cover.jpg`.
- **Catalog is a draft.** Names, shapes, and prices in `src/data/catalog.ts` are
  merchandising hypotheses. Prices are placeholders; nothing is in production.
- **No unverified claims.** No lead-free / dishwasher-safe / handmade /
  sustainable / warranty / shipping-time / compliance claims are made anywhere.
- **The cart is local.** It persists only in the browser via `localStorage`,
  never syncs, and cannot check out. Checkout deliberately **fails closed** to an
  honest boundary dialog that lists exactly what must exist before ordering could
  open.
- **No tracking.** No analytics, no ads, no cookies — and therefore no cookie
  banner.

## Architecture

Static, minimal, and framework-free at its core.

```
src/
  data/        catalog.ts (typed products), site.ts, product-images.ts
  lib/         cart.ts (pure cart logic), format.ts, url.ts  ← unit tested
  components/  BaseHead, SiteHeader, SiteFooter, PreLaunchBanner,
               ProductCard, CartRoot (drawer + boundary dialogs)
  layouts/     BaseLayout.astro
  scripts/     cart-ui.ts (client wiring around lib/cart)
  styles/      global.css (design tokens + components)
  pages/       index, about, policies, 404
public/        CNAME, robots.txt, favicon, og/
e2e/           Playwright specs
```

- **Catalog and cart math are pure TypeScript** (`src/lib`, `src/data`), so they
  are unit-tested in isolation and reused by the client script.
- **Cart dialogs use the native `<dialog>` element** for built-in focus
  trapping, Escape-to-close, and focus restore.
- **Images are optimized at build time** by Astro's sharp service (responsive
  `webp`).
- **SEO**: canonical URLs, OpenGraph/Twitter, sitemap (`@astrojs/sitemap`), and
  `Organization` + `WebSite` JSON-LD. No `Product`/`Offer` schema is emitted —
  marking offers would imply the draft catalog is orderable.

## Commands

```sh
npm install          # install dependencies
npm run dev          # local dev server
npm run lint         # astro check (type + template diagnostics)
npm test             # vitest — cart logic + catalog invariants
npm run build        # static build to ./dist
npm run test:e2e     # Playwright: browse/cart/boundary, keyboard, mobile,
                     # reduced motion, and an axe (WCAG A/AA) scan of the preview
```

The first e2e run needs the browser: `npx playwright install chromium`.

## Deployment (GitHub Pages)

- `.github/workflows/ci.yml` runs lint → unit tests → build → e2e on pushes and
  PRs to `main`.
- `.github/workflows/deploy.yml` builds and publishes `./dist` to GitHub Pages.
- `public/CNAME` declares `glasses.amalano.dev`, but the deploy workflow removes
  it from the artifact and builds with `/amalano-glass/` as the base until the
  repository variable `CUSTOM_DOMAIN_ACTIVE` is exactly `true`. This keeps the
  verified pre-DNS preview available at `https://amalano.github.io/amalano-glass/`.
- After Cloudflare DNS has a CNAME from `glasses` to `amalano.github.io`, set
  `CUSTOM_DOMAIN_ACTIVE=true` and rerun the deploy workflow. It will build at
  `/`, retain the CNAME file, and publish for `https://glasses.amalano.dev/`.

The integrator owns commit, review, and publication — this repository is not
auto-committed or deployed on your behalf.
