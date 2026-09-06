/**
 * Astro-only bindings from catalog ids to optimized local images.
 *
 * Kept separate from `catalog.ts` so the catalog stays framework-free and
 * unit-testable. Importing from `src/assets` lets Astro's sharp service emit
 * responsive, modern-format derivatives at build time.
 */
import type { ImageMetadata } from 'astro';
import type { ProductId } from './catalog';

import universal from '../assets/images/universal-pair.png';
import burgundy from '../assets/images/burgundy-pair.png';
import coupe from '../assets/images/coupe-pair.png';
import heroFamily from '../assets/images/hero-glass-family.png';

export const productImages: Readonly<Record<ProductId, ImageMetadata>> = {
  universal,
  burgundy,
  coupe,
};

export const heroImage = heroFamily;
