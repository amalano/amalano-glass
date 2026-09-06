# Amalano Glass

Public, static Astro storefront concept for `glasses.amalano.dev`.

## Truth and scope
- This is a pre-launch concept until Alex supplies real products, verified specifications, inventory, fulfillment/returns policy, legal entity/contact details, and a payment provider.
- Never imply products are currently orderable. Catalog entries and pricing are draft merchandising hypotheses, and the UI must label that truth clearly.
- Checkout must fail closed to an honest boundary dialog; do not collect personal/payment data and do not link to a fake checkout.
- Never claim lead-free, dishwasher-safe, handmade, sustainable, lifetime warranty, shipping times, or regulatory compliance unless backed by supplied evidence.
- Product imagery in `public/images/` is original AI-generated concept photography; disclose that in the preview notes/README, not as authentic product photography.

## Product / design
- Brand working name: **AMALANO GLASS**. Domain: `glasses.amalano.dev`.
- Primary surface: Explore; secondary: Decide/Learn.
- Original editorial-luxury visual system: warm limestone/ivory, black ink, restrained oxblood accent, expressive serif display with a precise sans body. Do not clone another brand.
- Avoid generic AI/SaaS motifs: no gradients, glassmorphism, feature-icon grid, fake reviews, fake metrics, invented testimonials, or unnecessary pills/cards.
- Mobile-first, semantic, keyboard accessible, visible focus, minimum 44px touch targets, WCAG AA contrast, reduced-motion support.

## Required experience
- Homepage/catalog with hero, three draft product cards (Universal, Burgundy, Coupe), shape/occasion comparison guidance, principles/process copy framed as intent rather than claims, and transparent pre-launch note.
- Working localStorage cart: add, quantity change, remove, subtotal, cart badge, open/close drawer/dialog, focus trapping, Escape close, focus restore.
- Checkout boundary: deterministic dialog explaining that ordering is not enabled and listing the exact information needed to activate it. No data collection.
- Policies/about pages with honest draft/pre-launch language; 404 page; robots/sitemap/SEO metadata, OpenGraph, canonical URL, JSON-LD that does not mark draft items as in-stock/orderable.
- No cookie banner or analytics while no tracking exists.

## Engineering gates
- Static Astro build, minimal dependencies, no remote runtime dependency for core content.
- Central typed product/catalog data and testable cart utilities.
- `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` must exist and pass.
- Vitest coverage for cart calculations/state normalization and draft catalog invariants.
- Playwright Chromium tests for primary browse/cart/boundary flow, keyboard dialog behavior, mobile overflow/touch targets, reduced motion, and axe scan against production preview.
- CI on pushes/PRs and a same-SHA, verification-gated GitHub Pages deployment. `public/CNAME` is only an artifact declaration; the custom hostname must also be configured through the GitHub Pages API after DNS is ready. Pages should remain usable at its GitHub project URL until that activation gate closes.
- Do not commit or push; the integrator owns exact-epoch review and publication.
