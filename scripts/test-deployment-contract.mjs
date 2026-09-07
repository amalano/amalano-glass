import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function option(name, fallback) {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const origin = option('origin', process.env.SITE_ORIGIN);
const rawBase = option('base', process.env.SITE_BASE ?? '/');
const cname = option('cname', 'ignore');
if (!origin) throw new Error('Expected --origin or SITE_ORIGIN');

const baseName = rawBase.replace(/^\/+|\/+$/g, '');
const base = baseName ? `/${baseName}/` : '/';
const indexPath = resolve('dist/index.html');
const verifierPath = resolve('scripts/verify-deployment-contract.mjs');
const original = readFileSync(indexPath, 'utf8');
const marker = '<!-- deployment-contract-mutation -->';

function runVerifier() {
  execFileSync(
    process.execPath,
    [verifierPath, `--origin=${origin}`, `--base=${base}`, `--cname=${cname}`],
    { cwd: process.cwd(), stdio: 'pipe' },
  );
}

function expectRejected(label, injectedHtml) {
  writeFileSync(indexPath, original.replace('</body>', `${marker}${injectedHtml}</body>`));
  try {
    runVerifier();
  } catch {
    return;
  } finally {
    writeFileSync(indexPath, original);
  }
  throw new Error(`Deployment verifier accepted ${label}`);
}

try {
  runVerifier();
  expectRejected('a missing relative href', '<a href="missing-relative-page/">broken</a>');
  expectRejected('a missing relative src', '<img src="missing-relative-image.webp" alt="">');
  expectRejected(
    'a missing relative srcset candidate',
    '<img srcset="missing-relative-image.webp 320w" alt="">',
  );
  expectRejected(
    'a relative application-JSON asset',
    '<script type="application/json">{"thumbnail":"missing-relative-thumbnail.webp"}</script>',
  );
  expectRejected(
    'an encoded traversal target',
    `<a href="${base}%2e%2e/package.json">escape</a>`,
  );
  console.log(
    JSON.stringify({
      status: 'PASS',
      origin,
      base,
      probes: 5,
      authenticArtifact: 'accepted',
      mutations: 'rejected',
    }),
  );
} finally {
  writeFileSync(indexPath, original);
}
