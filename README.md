# Amalano Glass

A public, **static Astro** storefront **concept** for `glasses.amalano.dev` — a
design study for a small line of stemware (the Universal, the Burgundy, and the
Coupe).

- **Live verified preview:** <https://amalano.github.io/amalano-glass/>
- **Research, viability decision, and activation plan:** [docs/decision-memo.md](docs/decision-memo.md)

> **Pre-launch, and honest about it.** This is not a live store. Nothing is for
> sale, no order can be placed, and the application collects no submitted or
> payment data. GitHub Pages still processes ordinary request data. The
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
- **No application tracking.** No embedded analytics, ads, or application/ad
  cookies. GitHub Pages still logs request information, including IP addresses,
  for security; the draft privacy notice discloses that host processing.

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
  pages/       index, about, policies, 404, generated robots.txt
public/        CNAME, favicon, og/
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
npm run verify:deployment # validate emitted URLs and referenced files in ./dist
npm run test:deployment   # mutation-probe relative, responsive, JSON, and traversal targets
```

The first e2e run needs the browser: `npx playwright install chromium`.

## Deployment (GitHub Pages)

- `.github/workflows/ci.yml` runs lint → unit tests → build → e2e in both the
  root/custom-domain and GitHub project-subpath modes. It also runs positive and
  adversarial deployment-contract checks, and permits a Pages deployment only
  after those gates pass for the same `main` SHA.
- `public/CNAME` declares `glasses.amalano.dev`, but the deploy workflow removes
  it from the artifact and builds with `/amalano-glass/` as the base until the
  repository variable `CUSTOM_DOMAIN_ACTIVE` is exactly `true`. This keeps the
  verified pre-DNS preview available at `https://amalano.github.io/amalano-glass/`.
- During that preview window, `SITE_ORIGIN=https://amalano.github.io` keeps the
  canonical, OpenGraph, JSON-LD, sitemap, and generated `robots.txt` URLs aligned
  with the URL that actually serves the site.
- A `CNAME` file inside an Actions artifact does **not** configure a custom
  domain by itself. Follow this order to avoid the subdomain-takeover window
  described in GitHub's [custom-domain security
  guidance](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#securing-your-custom-domain):

  1. In the `amalano` account's **Settings → Pages**, start verification of the
     parent domain `amalano.dev`. Publish the exact GitHub-provided TXT challenge
     in Cloudflare, complete verification, and retain the TXT record. See
     [Verifying your custom domain for GitHub
     Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).
  2. Claim `glasses.amalano.dev` on this repository **before** publishing its
     CNAME:

  ```sh
  gh api --method PUT repos/amalano/amalano-glass/pages \
    -f cname=glasses.amalano.dev
  ```

  3. Only after GitHub reports that repository association, publish the
     Cloudflare CNAME `glasses` → `amalano.github.io`.
  4. Verify DNS ownership, wait for GitHub's certificate, and require the Pages
     API to report both `cname: glasses.amalano.dev` and `https_enforced: true`.
  5. Then activate the root build and rerun its full same-SHA gate:

     ```sh
     gh variable set CUSTOM_DOMAIN_ACTIVE --repo amalano/amalano-glass --body true
     gh workflow run ci.yml --repo amalano/amalano-glass --ref main
     ```

  Fetch `https://glasses.amalano.dev/`, every local asset, `robots.txt`, and the
  sitemap before calling the domain active. The root build retains
  `public/CNAME` as an additional declaration, not as the configuration
  mechanism.

The integrator owns exact-epoch review and publication.
