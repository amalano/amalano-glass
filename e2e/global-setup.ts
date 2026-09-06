import { execFileSync, spawnSync } from 'node:child_process';
import { PREVIEW_PORT, PREVIEW_URL } from './server';

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return;
    } catch {
      /* server not up yet */
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Preview server did not become ready at ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

export default async function globalSetup(): Promise<void> {
  // Produce a fresh, optimized production build.
  execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });

  // Clear any stale daemon, then start the preview server (auto-daemonizes).
  spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
  execFileSync(
    'npx',
    ['astro', 'preview', '--port', String(PREVIEW_PORT), '--background'],
    { stdio: 'inherit' },
  );

  await waitForServer(`${PREVIEW_URL}/`, 30_000);
}
