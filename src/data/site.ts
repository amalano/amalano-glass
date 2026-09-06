/**
 * Central, framework-free site configuration.
 *
 * Kept as plain data (no Astro imports) so it can be consumed by components,
 * the client cart script, and unit tests alike.
 */

export interface NavItem {
  /** Root-absolute path; wrap with `href()` from `lib/url` when rendering. */
  readonly path: string;
  readonly label: string;
}

export const SITE = {
  /** Human brand name used in prose. */
  name: 'Amalano Glass',
  /** Wordmark spelling used in the masthead. */
  wordmark: 'AMALANO GLASS',
  domain: 'glasses.amalano.dev',
  /** Canonical production origin (custom domain). No trailing slash. */
  origin: 'https://glasses.amalano.dev',
  tagline: 'Stemware, considered.',
  /**
   * Meta description. Deliberately states the pre-launch truth so search
   * results never imply the set is orderable today.
   */
  description:
    'Amalano Glass is a pre-launch concept for a small, considered set of ' +
    'stemware — the Universal, the Burgundy, and the Coupe. A design study, ' +
    'not yet a shop: nothing here can be ordered.',
  locale: 'en',
  /** Default social share image, served from /public at a stable path. */
  ogImagePath: '/og/og-cover.jpg',
} as const;

export const NAV: readonly NavItem[] = [
  { path: '/', label: 'Explore' },
  { path: '/#choosing', label: 'Shapes & occasions' },
  { path: '/#intent', label: 'Intent' },
  { path: '/policies/', label: 'Policies' },
  { path: '/about/', label: 'About' },
] as const;

/**
 * The one-line truth shown in the persistent banner and echoed in metadata.
 * Update this in exactly one place if the launch status changes.
 */
export const PRELAUNCH_NOTE =
  'Pre-launch concept — a design study for glasses.amalano.dev. Nothing here ' +
  'is for sale yet, and no order can be placed.';

/** Exact list of what must be supplied before ordering can be turned on. */
export const ACTIVATION_REQUIREMENTS: readonly string[] = [
  'Finalized products with verified materials, dimensions, and capacities',
  'Real inventory and a fulfillment, shipping, and returns policy',
  'A registered legal entity with contact and support details',
  'A vetted payment provider and secure checkout',
  'Applicable tax, privacy, and consumer-protection terms',
] as const;
