import { spawnSync } from 'node:child_process';

export default async function globalTeardown(): Promise<void> {
  spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
}
