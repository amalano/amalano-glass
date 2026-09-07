import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

function option(name, fallback) {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const origin = option('origin', process.env.SITE_ORIGIN);
const rawBase = option('base', process.env.SITE_BASE ?? '/');
const cnameExpectation = option('cname', 'ignore');

if (!origin) throw new Error('Expected --origin or SITE_ORIGIN');
if (!['ignore', 'present', 'absent'].includes(cnameExpectation)) {
  throw new Error('Expected --cname=ignore, present, or absent');
}

const baseName = rawBase.replace(/^\/+|\/+$/g, '');
const base = baseName ? `/${baseName}/` : '/';
const publicRoot = new URL(base, origin).toString();
const root = resolve('dist');
const forbiddenOrigin = origin.includes('github.io')
  ? 'https://glasses.amalano.dev'
  : 'https://amalano.github.io';

function requireText(label, content, expected) {
  if (!content.includes(expected)) {
    throw new Error(`${label} missing ${JSON.stringify(expected)}`);
  }
}

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function routeForHtml(file) {
  const path = relative(root, file).split(sep).join('/');
  if (path === 'index.html') return '';
  if (path === '404.html') return '404/';
  if (path.endsWith('/index.html')) return `${path.slice(0, -'/index.html'.length)}/`;
  return path;
}

const publicOrigin = new URL(origin).origin;

function assertPublicTarget(value, sourceFile) {
  let rootedValue;
  if (value.startsWith('/')) {
    rootedValue = value;
  } else if (/^https?:\/\//.test(value)) {
    const url = new URL(value);
    if (url.origin !== publicOrigin) return;
    rootedValue = `${url.pathname}${url.search}${url.hash}`;
  } else {
    return;
  }

  if (!rootedValue.startsWith(base)) {
    throw new Error(
      `${relative(root, sourceFile)} contains URL outside base ${base}: ${value}`,
    );
  }

  const withoutSuffix = rootedValue.slice(base.length).split(/[?#]/, 1)[0];
  if (!withoutSuffix) return;

  const target = resolve(root, withoutSuffix);
  const candidates = [target, resolve(target, 'index.html')];
  if (withoutSuffix.endsWith('/')) {
    candidates.push(resolve(root, `${withoutSuffix.slice(0, -1)}.html`));
  }
  if (!candidates.some(existsSync)) {
    throw new Error(`${relative(root, sourceFile)} references missing local target ${value}`);
  }
}

const htmlFiles = filesUnder(root).filter((file) => file.endsWith('.html'));
if (htmlFiles.length === 0) throw new Error('No generated HTML files found');

for (const file of htmlFiles) {
  const label = relative(root, file).split(sep).join('/');
  const content = readFileSync(file, 'utf8');
  const expectedUrl = new URL(routeForHtml(file), publicRoot).toString();

  requireText(`${label} canonical`, content, `<link rel="canonical" href="${expectedUrl}">`);
  requireText(`${label} OpenGraph URL`, content, `<meta property="og:url" content="${expectedUrl}">`);
  if (content.includes(forbiddenOrigin)) {
    throw new Error(`${label} leaks inactive origin ${forbiddenOrigin}`);
  }

  // Validate ordinary links/images, every responsive image candidate, and
  // same-origin absolute URLs embedded in metadata or JSON-LD.
  for (const match of content.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    assertPublicTarget(match[1], file);
  }
  for (const match of content.matchAll(/srcset=["']([^"']+)["']/g)) {
    for (const candidate of match[1].split(',')) {
      const value = candidate.trim().split(/\s+/, 1)[0];
      if (value) assertPublicTarget(value, file);
    }
  }
  for (const match of content.matchAll(/https?:\/\/[^"'\s<>]+/g)) {
    assertPublicTarget(match[0], file);
  }
}

const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8');
requireText('homepage asset base', indexHtml, `${base}_astro/`);

const robots = readFileSync(resolve(root, 'robots.txt'), 'utf8');
const sitemapIndex = readFileSync(resolve(root, 'sitemap-index.xml'), 'utf8');
const sitemap = readFileSync(resolve(root, 'sitemap-0.xml'), 'utf8');
requireText('robots sitemap', robots, `Sitemap: ${publicRoot}sitemap-index.xml`);
requireText('sitemap index', sitemapIndex, `${publicRoot}sitemap-0.xml`);

for (const [label, content] of [
  ['robots', robots],
  ['sitemap index', sitemapIndex],
  ['sitemap', sitemap],
]) {
  if (content.includes(forbiddenOrigin)) {
    throw new Error(`${label} leaks inactive origin ${forbiddenOrigin}`);
  }
}

const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapLocations.length === 0) throw new Error('Sitemap has no page locations');
for (const location of sitemapLocations) {
  if (!location.startsWith(publicRoot)) {
    throw new Error(`Sitemap location is outside public root ${publicRoot}: ${location}`);
  }
}

const cnamePath = resolve(root, 'CNAME');
const cnameExists = existsSync(cnamePath);
if (cnameExpectation === 'present') {
  if (!cnameExists) throw new Error('Expected dist/CNAME to be present');
  const cname = readFileSync(cnamePath, 'utf8').trim();
  if (cname !== 'glasses.amalano.dev') {
    throw new Error(`Unexpected dist/CNAME value ${JSON.stringify(cname)}`);
  }
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
    htmlFiles: htmlFiles.length,
    sitemapPages: sitemapLocations.length,
    cname: cnameExists ? 'present' : 'absent',
  }),
);
