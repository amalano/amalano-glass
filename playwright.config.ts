import { defineConfig, devices } from '@playwright/test';
import { PREVIEW_URL } from './e2e/server';

// Astro 7's `preview` runs as a managed background daemon, so it can't be driven
// by Playwright's foreground `webServer`. Instead, global setup builds the site
// and starts the preview daemon; global teardown stops it. Tests — including the
// axe scan — therefore run against the real, optimized production preview.
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: PREVIEW_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
