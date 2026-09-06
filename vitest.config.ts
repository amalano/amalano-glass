import { defineConfig } from 'vitest/config';

// Unit tests cover the framework-free logic (cart math/state + catalog invariants).
// A plain Node environment keeps them fast and independent of the Astro build.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // e2e specs live under tests/ and are run by Playwright, not Vitest.
    exclude: ['tests/**', 'node_modules/**', 'dist/**'],
  },
});
