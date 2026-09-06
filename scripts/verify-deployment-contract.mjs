import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function option(name, fallback) {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const origin = option('origin', process.env.SITE_ORIGIN);
const rawBase = option('base', process.env.SITE_BASE ?? '/');
const cnameExpectation = option('cname', 'ignore');

if (!origin) throw new Error('Expected --origin or SITE_ORIGIN');
const base = `/${rawBase.replace(/^\/+|\/+$/g, '')}${rawBase === '/' ? '' : '/'}`;
const publicRoot = new URL(base, origin).toString();
const root = resolve('dist');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const robots = readFileSync(resolve(root, 'robots.txt'), 'utf8');
const sitemapIndex = readFileSync(resolve(root, 'sitemap-index.xml'), 'utf8');
const sitemap = readFileSync(resolve(root, 'sitemap-0.xml'), 'utf8');

function requireText(label, content, expected) {
  if (!content.includes(expected)) {
    throw new Error(`${label} missing ${JSON.stringify(expected)}`);
  }
}

requireText('canonical metadata', html, `<link rel="canonical" href="${publicRoot}">`);
requireText('OpenGraph URL', html, `<meta property="og:url" content="${publicRoot}">`);
requireText('asset base', html, `${base}_astro/`);
requireText('robots sitemap', robots, `Sitemap: ${publicRoot}sitemap-index.xml`);
requireText('sitemap index', sitemapIndex, `${publicRoot}sitemap-0.xml`);
requireText('sitemap pages', sitemap, publicRoot);

const forbiddenOrigin = origin.includes('github.io')
  ? 'https://glasses.amalano.dev'
  : 'https://amalano.github.io';
for (const [label, content] of [
  ['HTML', html],
  ['robots', robots],
  ['sitemap index', sitemapIndex],
  ['sitemap', sitemap],
]) {
  if (content.includes(forbiddenOrigin)) {
    throw new Error(`${label} leaks inactive origin ${forbiddenOrigin}`);
  }
}

const cnameExists = existsSync(resolve(root, 'CNAME'));
if (cnameExpectation === 'present' && !cnameExists) {
  throw new Error('Expected dist/CNAME to be present');
}
if (cnameExpectation === 'absent' && cnameExists) {
  throw new Error('Expected dist/CNAME to be absent');
}

console.log(
  JSON.stringify({
    status: 'PASS',
    origin,
    base,
    publicRoot,
    cname: cnameExists ? 'present' : 'absent',
  }),
);
