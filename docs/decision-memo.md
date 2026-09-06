# Amalano Glass — evidence, decision, and activation plan

**Reviewed:** 2026-09-06

**Market:** United States direct-to-consumer

**Decision:** **Conditional go for a one-product validation launch; no-go for accepting orders or running a broad paid-acquisition launch today.**

This memo separates observed evidence from inference and unvalidated assumptions. It is product and engineering issue-spotting, not legal, tax, or product-safety advice.

## Executive decision

A distinctive wine-glass brand is feasible, but the category is crowded, fragile to ship, and exposed to weak repeat purchase and expensive customer acquisition. The strongest initial proposition is not “another varietal-specific crystal range.” It is **hosting-proof elegance**: one versatile, cabinet-friendly form with documented durability, dishwasher, material, and parcel-testing evidence; a giftable pair or four-pack; and an easy single-glass replacement path.

Proceed in stages:

1. Keep the current site public as a truthful, non-transactional concept.
2. Validate product desirability with physical samples and moderated customer interviews.
3. Validate packaging and contribution margin with real parcels before paying for acquisition.
4. Launch one universal shape through Shopify only after every activation gate below is signed off.
5. Add Burgundy and Coupe only when the universal glass demonstrates acceptable breakage, returns, conversion, and contribution after acquisition.

## Evidence

### Demand and competition

- The [Wine Market Council 2025–2026 consumer snapshot](https://winemarketcouncil.com/wp-content/uploads/2026/04/2025-2026-snapshot-of-us-wine-consumers-and-trends.pdf) and [WSWA's category report](https://www.wswa.org/news/sipsource-2025-q2-report-highlights-persistent-category-headwinds-shifting-consumer-trends-and) document a pressured US wine category rather than a simple growth market. That is a counter-signal for a wine-only acquisition story.
- Overall US online retail remains material; the [US Census quarterly ecommerce series](https://www.census.gov/retail/eCommerce.html) is the appropriate primary series for current channel growth. Channel availability does not prove demand for this product.
- Live competitor observations on 2026-09-06 show a wide price ladder. Examples included [Made In crystal wine glasses](https://madeincookware.com/products/wine-glasses/4-piece-red) at $79 for four in observed structured product data, [Riedel Performance](https://www.riedel.com/en-us/riedel-performance-cabernet-merlot/688400098) at $99 for two, and [Zalto Universal](https://themanufactory.com/products/zalto-denkart-universal-glass-set-of-2) at $156 for two. [Glasvin](https://glas.vin/products/universal), [Gabriel-Glas](https://www.mygabrielglas.com/products/standart), and [Estelle Colored Glass](https://estellecoloredglass.com/products/estelle-colored-wine-stemware-set-of-2-iridescent) reinforce that “universal,” technical performance, and visual identity are already established positions.
- The current draft prices ($64–$72 per pair) occupy a difficult middle: above mass-market/value sets, below specialist prestige leaders, and not yet supported by physical product evidence.
- Returns are structurally important online. NRF projected a 19.3% online-sales return rate across retail for 2025; category-specific glassware rates may differ, but a general zero-return assumption is indefensible. See [NRF 2025 Retail Returns Landscape](https://nrf.com/research/2025-retail-returns-landscape).

### What is inferred

- A narrow audience—design-conscious hosts, apartment dwellers, and gift buyers—may value a small system more than varietal completeness.
- Replacement singles and verified cabinet/dishwasher fit may reduce the anxiety of owning thin-stemmed glassware.
- Product evidence can differentiate more credibly than untestable aroma or lifestyle claims.
- Organic culinary/design partnerships and gifting are more plausible early channels than a national paid-social rollout, but this remains to be tested.

### What remains hypothesis

- Customers will pay at least $68 for a pair from an unknown brand.
- The proposed silhouettes can be manufactured at target quality and cost.
- Packaging can hold breakage low enough to preserve contribution.
- An unknown brand can acquire customers below its pre-acquisition contribution.
- A three-shape family will outperform a one-shape hero offer.

## Illustrative unit economics—not a forecast

At the draft $68 pair price, a 2.9% + $0.30 payment fee is approximately $2.27. The table below uses invented scenario inputs solely to show which unknowns matter.

| Scenario | COGS | Packaging | Pick/pack | Shipping subsidy | Breakage/returns reserve | Contribution before CAC | After assumed CAC |
|---|---:|---:|---:|---:|---:|---:|---:|
| Optimistic | $18 | $6 | $5 | $0 | 5% | $33.33 (49.0%) | $18.33 at $15 CAC |
| Base | $24 | $8 | $7 | $6 | 10% | $13.93 (20.5%) | -$16.07 at $30 CAC |
| Stress | $30 | $10 | $9 | $12 | 15% | -$5.47 (-8.0%) | -$50.47 at $45 CAC |

**Gate:** do not buy traffic until landed COGS, packaging, dimensional weight, actual zone-based postage, processor fees, breakage, replacements, returns, support time, and tax tooling are measured. Require positive contribution after a conservative acquisition allowance and stress test.

## Commerce architecture decision

### Current stage: static concept

The Astro implementation is appropriate for a fast, auditable concept: no server, forms, analytics, application-level personal-data collection, inventory claim, or payment surface. GitHub Pages still processes request data, including IP addresses, as disclosed in the site's draft privacy notice. GitHub Pages is acceptable only for this non-transactional preview. GitHub states that Pages is not intended or permitted as free hosting for an online business or ecommerce site; move production commerce before enabling checkout. See [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

### Activation stage: Shopify-first

Use Shopify as the system of record for products, inventory, orders, shipping, taxes, refunds, and hosted checkout. Preserve the editorial front end only if a headless build still has a named operator and reliable inventory/cart reconciliation; otherwise launch with a Shopify theme first. Reconfirm current pricing before purchase at [Shopify pricing](https://www.shopify.com/pricing).

Why not the alternatives as the default:

- **Stripe Payment Links:** useful for a tightly bounded fixed-SKU pilot, with address collection, shipping rates, and automatic tax available. It still needs stock controls, reconciliation, fulfillment ownership, refunds, and signed webhook handling. See [Payment Links](https://docs.stripe.com/payment-links), [automatic tax](https://docs.stripe.com/payment-links/tax), and [webhook signature verification](https://docs.stripe.com/webhooks/signature). It is not the best primary inventory/order system for multiple fragile SKUs.
- **Snipcart:** keeps a static front end and supplies a cart, taxes, shipping hooks, inventory, and webhooks, but adds another operational surface and currently advertises a percentage platform fee. Use only if preserving the static front end is worth the integration and incident-response burden. See [Snipcart pricing](https://snipcart.com/pricing), [taxes](https://docs.snipcart.com/v3/setup/taxes), and [shipping](https://docs.snipcart.com/v3/setup/shipping).
- **Custom checkout:** rejected for launch. It expands payment-security, idempotency, tax, refund, inventory, fraud, webhook, and recovery work without creating customer value.

Any downstream automation must verify webhook signatures against the raw request body, deduplicate by provider event/delivery ID, persist state before acknowledging, retry safely, reconcile daily, and alert on failures. Shopify documents HMAC and delivery-ID checks in [Verify webhook deliveries](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries).

## Mandatory activation gates

Checkout remains disabled until one release packet contains all of the following.

1. **Product identity and claims**
   - Exact SKU, factory, bill of materials, country of origin, dimensions, capacity, weight, rim/foot geometry, finish, and lot traceability.
   - Independent migration/testing appropriate to the actual composition and decoration. Do not claim “lead-free,” “non-toxic,” “dishwasher-safe,” “handmade,” origin, sustainability, or performance without evidence. FDA's [Lead in Food and Foodwares](https://www.fda.gov/food/environmental-contaminants-food/lead-food-and-foodwares) and ASTM's [C927 glassware extraction method](https://store.astm.org/c0927-25a.html) are relevant starting points; the qualified lab/counsel must select the correct test plan.
   - A claims matrix mapping every public statement to dated evidence and approver.

2. **Safety, packaging, and breakage**
   - Supplier quality agreement, incoming inspection, lot sampling, complaint/incident process, stop-ship and recall drill.
   - Packaged-product testing for the real shipping configuration, followed by multi-zone live parcel trials. [ISTA test procedures](https://ista.org/test_procedures.php) are a starting point, not a substitute for the correct lab plan.
   - Defined replacement evidence, reserve, and damaged-goods disposal workflow.

3. **Inventory and fulfillment**
   - Counted sellable inventory with a safety reserve; no negative inventory, ambiguous preorder, or unbounded “continue selling” setting.
   - Golden orders to supported addresses, undeliverable/return-to-sender tests, cancellation race tests, partial shipment, reship, and lost/damaged parcel reconciliation.
   - Staffed support channel and response/escalation owner.

4. **Shipping, returns, and warranty**
   - Displayed shipping basis and delivery representation backed by actual capacity. The [FTC Mail, Internet, or Telephone Order Merchandise Rule](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-435) governs shipment promises, delay consent, cancellation, and prompt refunds.
   - Final returns/refunds policy tested against opened, damaged, gifted, partial, and lost orders.
   - If any written warranty is offered, its terms must be available before sale under [16 CFR Part 702](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-G/part-702).

5. **Seller, payments, tax, and fraud**
   - Registered seller of record, bank account, processor underwriting, recognizable statement descriptor, refund/chargeback authority, and incident owner.
   - Hosted checkout; no card data in the Astro app. Document PCI scope using the [PCI SSC ecommerce guidance](https://www.pcisecuritystandards.org/merchants/).
   - Nexus/registration determination by a qualified adviser, configured tax engine, and golden-address/refund reconciliation tests. Use the [Streamlined Sales Tax remote-seller state index](https://www.streamlinedsalestax.org/for-businesses/remote-seller-faqs/remote-seller-state-guidance) as a current state-source map, not a single nationwide rule.

6. **Privacy, accessibility, and operability**
   - Data inventory for checkout, email, support, analytics, ad pixels, processors, retention, deletion, and consumer requests; privacy notice must match actual flows.
   - Keyboard and screen-reader checkout tests, zoom/reflow, error messaging, and support alternative. The current concept follows the DOJ's [web accessibility guidance](https://www.ada.gov/resources/web-guidance/); production checkout adds third-party surfaces that must also be tested.
   - MFA, registrar lock, least-privilege access, secret storage, backups/exports, monitoring, failed-payment/dispute/webhook/unfulfilled-order alerts, daily payout/order/inventory reconciliation, rollback, and incident runbooks.

## Validation plan and stop conditions

### Phase 1 — product evidence
- Produce samples from at least two manufacturing runs.
- Run blind handling, cabinet-fit, dishwasher, and comparative-use sessions with target buyers.
- Stop if the universal shape does not show a clear preference or willingness-to-pay signal versus established alternatives.

### Phase 2 — parcel and economics
- Finalize packaging, run the selected ISTA/lab protocol, then ship instrumented parcels across representative zones.
- Build a lot-level breakage/return ledger and a real per-order contribution model.
- Stop if conservative contribution before paid acquisition cannot fund a realistic CAC and replacement reserve.

### Phase 3 — controlled commerce
- Configure Shopify in test mode; run golden orders, refunds, tax, inventory exhaustion, duplicate-event, failed-payment, and fulfillment exception tests.
- Open to a capped cohort only after a signed go-live packet; reconcile daily.
- Stop/kill checkout on inventory drift, tax mismatch, unbounded fulfillment aging, unhandled safety complaint, or breakage above the approved threshold.

### Phase 4 — assortment
- Add Burgundy or Coupe only when the hero SKU has reproducible product quality, support, parcel, return, and contribution evidence.

## Current conclusion

The brand and site direction are viable as a **validation vehicle**. The website is ready to communicate the concept, not to transact. The next irreducible decision is physical: choose the manufacturer/product specification and supply real commercial facts. Payment activation is intentionally a later, explicit authorization boundary.
