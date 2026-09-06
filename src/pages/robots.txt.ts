import type { APIRoute } from 'astro';

export const prerender = true;

/** Build a robots file whose sitemap URL follows both SITE_ORIGIN and SITE_BASE. */
export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://glasses.amalano.dev');
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const sitemap = new URL(`${base.replace(/^\//, '')}sitemap-index.xml`, origin).toString();

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
